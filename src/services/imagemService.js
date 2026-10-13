const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const MSG = require("../utils/messages");
const HTTP_STATUS = require("../utils/httpsStatus");
const atividadeService = require("./atividadeService");

const SELECT_IMAGEM = {
  id: true,
  nome: true,
  tag: true,
  portaExposta: true,
  digest: true,
  ultimoPushEm: true,
  visibilidade: true,
  origem: true,
  ativo: true,
  plataformaId: true,
  plataforma: { select: { id: true, nome: true, tipo: true } },
  criadoEm: true,
  atualizadoEm: true,
};

async function obterImagemOuFalhar(id) {
  const imagem = await prisma.imagemContainer.findUnique({
    where: { id },
    select: SELECT_IMAGEM,
  });

  if (!imagem) {
    throw new AppError(MSG.IMAGEM.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  return imagem;
}

// Só plataformas de containerização, e ativas, podem ter imagens
async function garantirPlataformaValida(plataformaId) {
  const plataforma = await prisma.plataforma.findUnique({
    where: { id: plataformaId },
    select: { id: true, tipo: true, ativo: true },
  });

  if (!plataforma) {
    throw new AppError(MSG.PLATAFORMA.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  if (plataforma.tipo !== "CONTAINERIZACAO") {
    throw new AppError(MSG.IMAGEM.PLATAFORMA_INVALIDA, HTTP_STATUS.CONFLICT);
  }

  if (!plataforma.ativo) {
    throw new AppError(MSG.IMAGEM.PLATAFORMA_INATIVA, HTTP_STATUS.CONFLICT);
  }
}

// A restrição única (plataforma + nome + tag) da BD apanha as duplicadas
function tratarImagemDuplicada(erro) {
  if (erro && erro.code === "P2002") {
    throw new AppError(MSG.IMAGEM.JA_EXISTE, HTTP_STATUS.CONFLICT);
  }
  throw erro;
}

async function listarImagens(plataformaId) {
  return prisma.imagemContainer.findMany({
    where: plataformaId ? { plataformaId } : undefined,
    select: SELECT_IMAGEM,
    orderBy: [{ plataforma: { nome: "asc" } }, { nome: "asc" }, { tag: "asc" }],
  });
}

async function obterImagem(id) {
  return obterImagemOuFalhar(id);
}

async function criarImagem(dados, usuarioId) {
  await garantirPlataformaValida(dados.plataformaId);

  try {
    return await prisma.$transaction(async (tx) => {
      const criada = await tx.imagemContainer.create({
        data: dados,
        select: SELECT_IMAGEM,
      });

      await atividadeService.registrar(tx, {
        usuarioId,
        acao: `Criou a imagem "${criada.nome}:${criada.tag}" na plataforma "${criada.plataforma.nome}"`,
      });

      return criada;
    });
  } catch (erro) {
    return tratarImagemDuplicada(erro);
  }
}

async function atualizarImagem(id, dados, usuarioId) {
  await obterImagemOuFalhar(id);

  try {
    return await prisma.$transaction(async (tx) => {
      const atualizada = await tx.imagemContainer.update({
        where: { id },
        data: dados,
        select: SELECT_IMAGEM,
      });

      await atividadeService.registrar(tx, {
        usuarioId,
        acao: `Atualizou a imagem "${atualizada.nome}:${atualizada.tag}"`,
      });

      return atualizada;
    });
  } catch (erro) {
    return tratarImagemDuplicada(erro);
  }
}

async function apagarImagem(id, usuarioId) {
  const atual = await obterImagemOuFalhar(id);

  return prisma.$transaction(async (tx) => {
    await tx.imagemContainer.delete({ where: { id } });

    await atividadeService.registrar(tx, {
      usuarioId,
      acao: `Apagou a imagem "${atual.nome}:${atual.tag}"`,
    });
  });
}

module.exports = {
  listarImagens,
  obterImagem,
  criarImagem,
  atualizarImagem,
  apagarImagem,
};