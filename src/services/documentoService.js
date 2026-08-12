const prisma = require("../config/prisma");
const MSG = require("../utils/messages");
const HTTP_STATUS = require("../utils/httpsStatus");
const AppError = require("../utils/AppError");
const { parseId, formatarDocumento } = require("../utils/fileHelper");

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
      ...(sistemaIdNum&&{ sistemaId : sistemaIdNum}),
    },
    include: includePadrao,
  });

  return formatarDocumento(novoDocumento);
};

exports.listarDocumentos = async (perfil, apenasLixeira=false) => {
  const where = perfil === "ADMIN" ? {} : { categoria: { sensivel: false } };
  where.apagadoEm = apenasLixeira ? { not: null } : null;



  const documentos = await prisma.documento.findMany({
    where,
    include: includePadrao,
    orderBy: apenasLixeira?{apagadoEm:"desc"} : { dataSubmissao: "desc" },
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

// Atualização parcial: título, descrição, categoria, e/ou estado (aprovar/rejeitar)
exports.atualizarDocumento = async (id, dados, perfil) => {
  const idNum = parseId(id, MSG.VALIDATION.INVALID_ID);

  const documentoExiste = await prisma.documento.findUnique({ where: { id: idNum } });
  if (!documentoExiste) throw new AppError(MSG.DOCUMENTO.NOT_FOUND, HTTP_STATUS.NOT_FOUND);

  const dadosParaAtualizar = {};

  // Mudar o estado (aprovar/rejeitar) é exclusivo de ADMIN
  const novoEstado = dados.estado;
  if (novoEstado) {
    if (perfil !== "ADMIN") {
      throw new AppError(MSG.AUTH.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
    }

    dadosParaAtualizar.estado = novoEstado.toUpperCase();

    if (dadosParaAtualizar.estado === "REJEITADO") {
      dadosParaAtualizar.motivoRejeicao = dados.motivoRejeicao || "Não especificado";
    }
  }

 if (dados.apagadoEm === null) {
    if (perfil !== "ADMIN") {
      throw new AppError(MSG.AUTH.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
    }
    dadosParaAtualizar.apagadoEm = null;
  }


  if (dados.titulo) dadosParaAtualizar.titulo = dados.titulo;
  if (dados.descricao !== undefined) dadosParaAtualizar.descricao = dados.descricao;
  if (dados.categoriaId) dadosParaAtualizar.categoriaId = parseId(dados.categoriaId, MSG.VALIDATION.INVALID_ID);

  const documentoAtualizado = await prisma.documento.update({
    where: { id: idNum },
    data: dadosParaAtualizar,
    include: includePadrao,
  });

  return formatarDocumento(documentoAtualizado);
};

exports.eliminarDocumento = async (id, definitivo = false) => {
  const idNum = parseId(id, MSG.VALIDATION.INVALID_ID);

  const documentoExiste = await prisma.documento.findUnique({ where: { id: idNum } });
  if (!documentoExiste) throw new AppError(MSG.DOCUMENTO.NOT_FOUND, HTTP_STATUS.NOT_FOUND);

  if (definitivo) {
    if (!documentoExiste.apagadoEm) {
      throw new AppError("O documento precisa de estar na lixeira antes de ser eliminado definitivamente.", HTTP_STATUS.BAD_REQUEST);
    }
    await prisma.documento.delete({ where: { id: idNum } });
    return true;
  }

  await prisma.documento.update({
    where: { id: idNum },
    data: { apagadoEm: new Date() },
  });

  return true;
};