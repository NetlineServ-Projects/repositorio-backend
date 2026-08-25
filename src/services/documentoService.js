const prisma = require("../config/prisma");
const MSG = require("../utils/messages");
const HTTP_STATUS = require("../utils/httpsStatus");
const AppError = require("../utils/AppError");
const { parseId, formatarDocumento } = require("../utils/fileHelper");
const atividadeService = require("./atividadeService");

const includePadrao = {
  categoria: true,
  usuario: {
    select: { id: true, nome: true, email: true },
  },
};

exports.criarDocumento = async (dados, usuario) => {
  if (!dados.categoriaId) {
    throw new AppError(MSG.VALIDATION.CATEGORIA_REQUIRED, HTTP_STATUS.BAD_REQUEST);
  }

  const categoriaIdNum = parseId(dados.categoriaId, MSG.VALIDATION.INVALID_ID);
  const usuarioIdNum = parseId(usuario.id || usuario.usuarioId, MSG.VALIDATION.INVALID_ID);
  const sistemaIdNum = dados.sistemaId ? parseId(dados.sistemaId, MSG.VALIDATION.INVALID_ID) : undefined;

  // ADMIN publica imediatamente; FUNCIONARIO fica a aguardar aprovação
  const estadoInicial = usuario.perfil === "ADMIN" ? "APROVADO" : "PENDENTE";

  const novoDocumento = await prisma.documento.create({
    data: {
      titulo: dados.titulo || dados.nomeArquivo,
      descricao: dados.descricao || "",
      nomeArquivo: dados.nomeArquivo,
      caminho: dados.caminho,
      tipoArquivo: dados.tipoArquivo,
      tamanho: BigInt(dados.tamanho || 0),
      categoriaId: categoriaIdNum,
      usuarioId: usuarioIdNum,
      estado: estadoInicial,
      ...(sistemaIdNum && { sistemaId: sistemaIdNum }),
    },
    include: includePadrao,
  });

  await atividadeService.registrar({
    usuario: usuario.nome,
    acao: usuario.perfil === "ADMIN" ? "publicou o documento" : "submeteu o documento",
    alvo: sistemaIdNum
      ? `${novoDocumento.titulo} (anexado a um sistema)`
      : novoDocumento.titulo,
  });

  return formatarDocumento(novoDocumento);
};

exports.listarDocumentos = async (perfil, apenasLixeira = false) => {
  const where = perfil === "ADMIN" ? {} : { categoria: { sensivel: false } };
  where.apagadoEm = apenasLixeira ? { not: null } : null;

  const documentos = await prisma.documento.findMany({
    where,
    include: includePadrao,
    orderBy: apenasLixeira ? { apagadoEm: "desc" } : { dataSubmissao: "desc" },
  });

  return documentos.map(formatarDocumento);
};

exports.buscarDocumentoPorId = async (id, perfil) => {
  const idNum = parseId(id, MSG.VALIDATION.INVALID_ID);

  const documento = await prisma.documento.findUnique({
    where: { id: idNum },
    include: includePadrao,
  });

  if (!documento) throw new AppError(MSG.DOCUMENTO.NOT_FOUND, HTTP_STATUS.NOT_FOUND);

  if (documento.categoria.sensivel && perfil !== "ADMIN") {
    throw new AppError(MSG.DOCUMENTO.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  return formatarDocumento(documento);
};

// --- Funções auxiliares de atualizarDocumento ---
// Cada uma calcula apenas o pedaço de "dadosParaAtualizar" que lhe compete.
// Não tocam na BD — quem escreve é sempre atualizarDocumento, numa única chamada.

function calcularMudancaEstado(dados, perfil) {
  if (!dados.estado) return {};
  if (perfil !== "ADMIN") {
    throw new AppError(MSG.AUTH.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
  }

  const estado = dados.estado.toUpperCase();
  const resultado = { estado };
  if (estado === "REJEITADO") {
    resultado.motivoRejeicao = dados.motivoRejeicao || "Não especificado";
  }
  return resultado;
}

function calcularRestauro(dados, perfil) {
  if (dados.apagadoEm !== null) return {};
  if (perfil !== "ADMIN") {
    throw new AppError(MSG.AUTH.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
  }
  return { apagadoEm: null };
}

function calcularEdicaoCampos(dados) {
  const resultado = {};
  if (dados.titulo) resultado.titulo = dados.titulo;
  if (dados.descricao !== undefined) resultado.descricao = dados.descricao;
  if (dados.categoriaId) resultado.categoriaId = parseId(dados.categoriaId, MSG.VALIDATION.INVALID_ID);
  return resultado;
}

// Atualização parcial: título, descrição, categoria, e/ou estado (aprovar/rejeitar/restaurar)
// nomeUsuario é necessário para registar a atividade (vem do req.usuario no controller)
exports.atualizarDocumento = async (id, dados, perfil, nomeUsuario) => {
  const idNum = parseId(id, MSG.VALIDATION.INVALID_ID);

  const documentoExiste = await prisma.documento.findUnique({ where: { id: idNum } });
  if (!documentoExiste) throw new AppError(MSG.DOCUMENTO.NOT_FOUND, HTTP_STATUS.NOT_FOUND);

  const dadosParaAtualizar = {
    ...calcularMudancaEstado(dados, perfil),
    ...calcularRestauro(dados, perfil),
    ...calcularEdicaoCampos(dados),
  };

  const documentoAtualizado = await prisma.documento.update({
    where: { id: idNum },
    data: dadosParaAtualizar,
    include: includePadrao,
  });

  if (dadosParaAtualizar.estado === "APROVADO") {
    await atividadeService.registrar({
      usuario: nomeUsuario,
      acao: "aprovou o documento",
      alvo: documentoAtualizado.titulo,
    });
  } else if (dadosParaAtualizar.estado === "REJEITADO") {
    await atividadeService.registrar({
      usuario: nomeUsuario,
      acao: "rejeitou o documento",
      alvo: documentoAtualizado.titulo,
    });
  } else if (dadosParaAtualizar.apagadoEm === null) {
    await atividadeService.registrar({
      usuario: nomeUsuario,
      acao: "restaurou o documento",
      alvo: documentoAtualizado.titulo,
    });
  }

  return formatarDocumento(documentoAtualizado);
};

exports.eliminarDocumento = async (id, definitivo = false, nomeUsuario) => {
  const idNum = parseId(id, MSG.VALIDATION.INVALID_ID);

  const documentoExiste = await prisma.documento.findUnique({ where: { id: idNum } });
  if (!documentoExiste) throw new AppError(MSG.DOCUMENTO.NOT_FOUND, HTTP_STATUS.NOT_FOUND);

  if (definitivo) {
    if (!documentoExiste.apagadoEm) {
      throw new AppError(
        "O documento precisa de estar na lixeira antes de ser eliminado definitivamente.",
        HTTP_STATUS.BAD_REQUEST
      );
    }
    await prisma.documento.delete({ where: { id: idNum } });

    if (nomeUsuario) {
      await atividadeService.registrar({
        usuario: nomeUsuario,
        acao: "eliminou definitivamente o documento",
        alvo: documentoExiste.titulo,
      });
    }
    return true;
  }

  await prisma.documento.update({
    where: { id: idNum },
    data: { apagadoEm: new Date() },
  });

  if (nomeUsuario) {
    await atividadeService.registrar({
      usuario: nomeUsuario,
      acao: "moveu para a lixeira o documento",
      alvo: documentoExiste.titulo,
    });
  }

  return true;
};