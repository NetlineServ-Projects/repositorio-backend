const prisma = require("../config/prisma");

exports.criarDocumento = async (dados, usuario) => {
  if (!dados.categoriaId) {
    throw new Error("A categoria é obrigatória.");
  }

  const categoriaIdNum = Number(dados.categoriaId);
  if (isNaN(categoriaIdNum)) {
    throw new Error("ID de categoria inválido.");
  }

  // Mapeia o ID do utilizador (suporta usuario.id ou usuario.usuarioId)
  const usuarioIdNum = Number(usuario.id || usuario.usuarioId);
  if (isNaN(usuarioIdNum)) {
    throw new Error("ID de utilizador inválido.");
  }

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
      estado: "PENDENTE", // Estado inicial padrão
    },
    include: {
      categoria: {
        select:{nome:true}
      }, 
      usuario: {
        select: { id: true, nome: true, email: true },
      },
    },
  });

  return {
    ...novoDocumento,
    tamanho: novoDocumento.tamanho.toString(),
  };
};

exports.listarDocumentos = async () => {
  const documentos = await prisma.documento.findMany({
    include: {
      categoria: true,
      usuario: {
        select: { id: true, nome: true, email: true },
      },
    },
    orderBy: { dataSubmissao: "desc" },
  });

  // Converte BigInt (tamanho) para String para não falhar no JSON.stringify
  return documentos.map((doc) => ({
    ...doc,
    tamanho: doc.tamanho ? doc.tamanho.toString() : "0",
  }));
};

exports.buscarDocumentoPorId = async (id) => {
  const idNum = Number(id);
  if (isNaN(idNum)) throw new Error("ID de documento inválido.");

  const documento = await prisma.documento.findUnique({
    where: { id: idNum },
    include: {
      categoria: true,
      usuario: {
        select: { id: true, nome: true, email: true },
      },
    },
  });

  if (!documento) throw new Error("Documento não encontrado.");

  return {
    ...documento,
    tamanho: documento.tamanho ? documento.tamanho.toString() : "0",
  };
};

exports.aprovarDocumento = async (id) => {
  const idNum = Number(id);
  if (isNaN(idNum)) throw new Error("ID inválido.");

  const documentoAtualizado = await prisma.documento.update({
    where: { id: idNum },
    data: { estado: "APROVADO" },
    include: { categoria: true, usuario: true },
  });

  return {
    ...documentoAtualizado,
    tamanho: documentoAtualizado.tamanho.toString(),
  };
};

exports.rejeitarDocumento = async (id, body) => {
  const idNum = Number(id);
  if (isNaN(idNum)) throw new Error("ID inválido.");

  const documentoAtualizado = await prisma.documento.update({
    where: { id: idNum },
    data: {
      estado: "REJEITADO",
      motivoRejeicao: body?.motivo || body?.motivoRejeicao || "Não especificado",
    },
    include: { categoria: true, usuario: true },
  });

  return {
    ...documentoAtualizado,
    tamanho: documentoAtualizado.tamanho.toString(),
  };
};

exports.atualizarDocumento = async (id, dados) => {
  const idNum = Number(id);
  if (isNaN(idNum)) throw new Error("ID inválido.");

  const documentoExiste = await prisma.documento.findUnique({
    where: { id: idNum },
  });

  if (!documentoExiste) throw new Error("Documento não encontrado.");

  // Prepara o objeto de atualização dinamicamente
  const dadosParaAtualizar = {};

  // Aceita tanto 'estado' quanto 'status' enviados pelo frontend
  const novoEstado = dados.estado || dados.status;
  if (novoEstado) {
    dadosParaAtualizar.estado = novoEstado.toUpperCase();
  }

  if (dados.titulo) dadosParaAtualizar.titulo = dados.titulo;
  if (dados.descricao !== undefined) dadosParaAtualizar.descricao = dados.descricao;
  if (dados.categoriaId) dadosParaAtualizar.categoriaId = Number(dados.categoriaId);

  const documentoAtualizado = await prisma.documento.update({
    where: { id: idNum },
    data: dadosParaAtualizar,
    include: {
      categoria: true,
      usuario: { select: { id: true, nome: true, email: true } },
    },
  });

  return {
    ...documentoAtualizado,
    tamanho: documentoAtualizado.tamanho.toString(),
  };
};

exports.eliminarDocumento = async (id) => {
  const idNum = Number(id);
  if (isNaN(idNum)) throw new Error("ID inválido.");

  const documentoExiste = await prisma.documento.findUnique({
    where: { id: idNum },
  });

  if (!documentoExiste) throw new Error("Documento não encontrado.");

  await prisma.documento.delete({
    where: { id: idNum },
  });

  return true;
};