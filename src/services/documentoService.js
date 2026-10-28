const prisma = require("../config/prisma");
const MSG = require("../utils/messages");
const HTTP_STATUS = require("../utils/httpsStatus");
const AppError = require("../utils/AppError");
const { parseId, formatarDocumento } = require("../utils/fileHelper");
const atividadeService = require("./atividadeService");
const notificacaoService = require("./notificacaoService");

const includePadrao = {
  categoria: true,
  usuario: {
    select: { id: true, nome: true, email: true },
  },
  // Documentos anexados a partir de um sistema dizem a que sistema pertencem
  sistema: {
    select: { id: true, nome: true },
  },
};

// ---------------------------------------------------------------------------
// Funções auxiliares pequenas — cada uma responde a UMA pergunta.
// Não tocam na base de dados; só calculam valores a partir dos dados recebidos.
// ---------------------------------------------------------------------------

function estadoInicialParaCriacao(perfil) {
  // ADMIN publica imediatamente; FUNCIONARIO fica a aguardar aprovação
  return perfil === "ADMIN" ? "APROVADO" : "PENDENTE";
}

function acaoDeCriacao(perfil, nomeSistema) {
  const base = perfil === "ADMIN" ? "publicou o documento" : "submeteu o documento";
  return nomeSistema ? `${base} no sistema "${nomeSistema}"` : base;
}

function calcularMudancaEstado(dados, perfil) {
  if (!dados.estado) return {};
  if (perfil !== "ADMIN") throw new AppError(MSG.AUTH.FORBIDDEN, HTTP_STATUS.FORBIDDEN);

  const estado = dados.estado.toUpperCase();
  const resultado = { estado };
  if (estado === "REJEITADO") {
    resultado.motivoRejeicao = dados.motivoRejeicao || "Não especificado";
  }
  return resultado;
}

function calcularRestauro(dados, perfil) {
  if (dados.apagadoEm !== null) return {};
  if (perfil !== "ADMIN") throw new AppError(MSG.AUTH.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
  return { apagadoEm: null };
}

function calcularEdicaoCampos(dados) {
  const resultado = {};
  if (dados.titulo) resultado.titulo = dados.titulo;
  if (dados.descricao !== undefined) resultado.descricao = dados.descricao;
  if (dados.categoriaId) resultado.categoriaId = parseId(dados.categoriaId, MSG.VALIDATION.INVALID_ID);
  return resultado;
}

function acaoDeAtualizacao(dadosParaAtualizar) {
  if (dadosParaAtualizar.estado === "APROVADO") return "aprovou o documento";
  if (dadosParaAtualizar.estado === "REJEITADO") return "rejeitou o documento";
  if (dadosParaAtualizar.apagadoEm === null) return "restaurou o documento";
  return null; // edição de titulo/descricao/categoria não gera atividade
}

// ---------------------------------------------------------------------------
// Operações principais
// ---------------------------------------------------------------------------

exports.criarDocumento = async (dados, usuario) => {
  if (!dados.categoriaId) {
    throw new AppError(MSG.VALIDATION.CATEGORIA_REQUIRED, HTTP_STATUS.BAD_REQUEST);
  }

  const categoriaIdNum = parseId(dados.categoriaId, MSG.VALIDATION.INVALID_ID);
  const usuarioIdNum = parseId(usuario.id || usuario.usuarioId, MSG.VALIDATION.INVALID_ID);
  const sistemaIdNum = dados.sistemaId ? parseId(dados.sistemaId, MSG.VALIDATION.INVALID_ID) : undefined;

  const novoDocumento = await prisma.$transaction(async (tx) => {
    const documento = await tx.documento.create({
      data: {
        titulo: dados.titulo || dados.nomeArquivo,
        descricao: dados.descricao || "",
        nomeArquivo: dados.nomeArquivo,
        caminho: dados.caminho,
        tipoArquivo: dados.tipoArquivo,
        tamanho: BigInt(dados.tamanho || 0),
        categoriaId: categoriaIdNum,
        usuarioId: usuarioIdNum,
        estado: estadoInicialParaCriacao(usuario.perfil),
        ...(sistemaIdNum && { sistemaId: sistemaIdNum }),
      },
      include: includePadrao,
    });

    await atividadeService.registrar(tx, {
      usuarioId: usuarioIdNum,
      acao: acaoDeCriacao(usuario.perfil, documento.sistema?.nome),
      documentoId: documento.id,
      sistemaId: documento.sistemaId ?? undefined,
    });

    // Um documento à espera de aprovação avisa os ADMIN, para irem ao painel de aprovações
    if (documento.estado === "PENDENTE") {
      await notificacaoService.notificarAdmins(tx, {
        tipo: "DOCUMENTO_SUBMETIDO",
        // O admin vê logo a que sistema o documento pertence
        referencia: documento.sistema ? `${documento.titulo} · ${documento.sistema.nome}` : documento.titulo,
        documentoId: documento.id,
        excetoUsuarioId: usuarioIdNum,
      });
    }

    return documento;
  });

  return formatarDocumento(novoDocumento);
};

// Um FUNCIONARIO só vê documentos publicados (APROVADO) e os que ele próprio submeteu;
// os pendentes/rejeitados dos outros só existem para quem os submeteu e para os ADMIN
function podeVerDocumento(documento, usuario) {
  if (usuario.perfil === "ADMIN") return true;
  if (documento.categoria?.sensivel) return false;
  return documento.estado === "APROVADO" || documento.usuarioId === Number(usuario.id);
}

// Também usada para servir os ficheiros em /uploads (middleware ficheirosProtegidos)
exports.podeVerDocumento = podeVerDocumento;

exports.listarDocumentos = async (usuario, apenasLixeira = false) => {
  const where =
    usuario.perfil === "ADMIN"
      ? {}
      : {
          categoria: { sensivel: false },
          OR: [{ estado: "APROVADO" }, { usuarioId: Number(usuario.id) }],
        };
  where.apagadoEm = apenasLixeira ? { not: null } : null;

  const documentos = await prisma.documento.findMany({
    where,
    include: includePadrao,
    orderBy: apenasLixeira ? { apagadoEm: "desc" } : { dataSubmissao: "desc" },
  });

  return documentos.map(formatarDocumento);
};

exports.buscarDocumentoPorId = async (id, usuario) => {
  const idNum = parseId(id, MSG.VALIDATION.INVALID_ID);

  const documento = await prisma.documento.findUnique({
    where: { id: idNum },
    include: includePadrao,
  });

  if (!documento) throw new AppError(MSG.DOCUMENTO.NOT_FOUND, HTTP_STATUS.NOT_FOUND);

  if (!podeVerDocumento(documento, usuario)) {
    throw new AppError(MSG.DOCUMENTO.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  return formatarDocumento(documento);
};

// Atualização parcial: título, descrição, categoria, e/ou estado (aprovar/rejeitar/restaurar).
// usuarioAtual precisa de { id, nome } — o id vai para a Atividade, o nome não é usado aqui
// (fica disponível para quem chamar, se precisar de o mostrar antes de ter a resposta).
exports.atualizarDocumento = async (id, dados, perfil, usuarioAtual) => {
  const idNum = parseId(id, MSG.VALIDATION.INVALID_ID);
  const usuarioIdNum = parseId(usuarioAtual.id, MSG.VALIDATION.INVALID_ID);

  const documentoAtualizado = await prisma.$transaction(async (tx) => {
    const documentoExiste = await tx.documento.findUnique({ where: { id: idNum } });
    if (!documentoExiste) throw new AppError(MSG.DOCUMENTO.NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    const dadosParaAtualizar = {
      ...calcularMudancaEstado(dados, perfil),
      ...calcularRestauro(dados, perfil),
      ...calcularEdicaoCampos(dados),
    };

    const documento = await tx.documento.update({
      where: { id: idNum },
      data: dadosParaAtualizar,
      include: includePadrao,
    });

    const acao = acaoDeAtualizacao(dadosParaAtualizar);
    if (acao) {
      await atividadeService.registrar(tx, { usuarioId: usuarioIdNum, acao, documentoId: documento.id });
    }

    // Quem submeteu fica a saber da decisão (com o motivo, se for rejeitado)
    const decisao = dadosParaAtualizar.estado;
    const mudouDeEstado = decisao && decisao !== documentoExiste.estado;
    if (mudouDeEstado && ["APROVADO", "REJEITADO"].includes(decisao) && documento.usuarioId !== usuarioIdNum) {
      await notificacaoService.notificarUsuario(tx, {
        usuarioId: documento.usuarioId,
        tipo: decisao === "APROVADO" ? "DOCUMENTO_APROVADO" : "DOCUMENTO_REJEITADO",
        referencia: documento.titulo,
        mensagem: decisao === "REJEITADO" ? documento.motivoRejeicao : null,
        documentoId: documento.id,
      });
    }

    return documento;
  });

  return formatarDocumento(documentoAtualizado);
};

exports.eliminarDocumento = async (id, definitivo = false, usuarioAtual) => {
  const idNum = parseId(id, MSG.VALIDATION.INVALID_ID);
  const usuarioIdNum = usuarioAtual ? parseId(usuarioAtual.id, MSG.VALIDATION.INVALID_ID) : null;

  await prisma.$transaction(async (tx) => {
    const documentoExiste = await tx.documento.findUnique({ where: { id: idNum } });
    if (!documentoExiste) throw new AppError(MSG.DOCUMENTO.NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    if (definitivo) {
      if (!documentoExiste.apagadoEm) {
        throw new AppError(
          "O documento precisa de estar na lixeira antes de ser eliminado definitivamente.",
          HTTP_STATUS.BAD_REQUEST
        );
      }
      await tx.documento.delete({ where: { id: idNum } });
    } else {
      await tx.documento.update({ where: { id: idNum }, data: { apagadoEm: new Date() } });
    }

    if (usuarioIdNum) {
      await atividadeService.registrar(tx, {
        usuarioId: usuarioIdNum,
        acao: definitivo ? "eliminou definitivamente o documento" : "moveu para a lixeira o documento",
        // se o delete foi definitivo, o documento já não existe — não há documentoId válido para ligar
        documentoId: definitivo ? null : idNum,
      });
    }
  });

  return true;
};