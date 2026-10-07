const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const MSG = require("../utils/messages");
const HTTP_STATUS = require("../utils/httpsStatus");
const atividadeService = require("./atividadeService");

const TIPO_GESTAO_DOMINIO = "GESTAO_DOMINIO";

// Rótulos legíveis do tipo para o registo de atividades
const ROTULO_TIPO = {
  CLOUD_BASE_DADOS: "Cloud/Base de dados",
  CONTAINERIZACAO: "Containerização",
  GESTAO_DOMINIO: "Gestão de domínio",
};

// Nunca devolve nada sensível: a plataforma só tem dados de identificação
const SELECT_PLATAFORMA = {
  id: true,
  nome: true,
  tipo: true,
  urlPainel: true,
  ativo: true,
  criadoEm: true,
  atualizadoEm: true,
  _count: { select: { dominios: true, servidores: true, infraestruturas: true } },
};

function formatar(plataforma) {
  const { _count, ...resto } = plataforma;
  return {
    ...resto,
    totais: {
      dominios: _count.dominios,
      servidores: _count.servidores,
      sistemas: _count.infraestruturas,
    },
  };
}

async function obterPlataformaOuFalhar(id) {
  const plataforma = await prisma.plataforma.findUnique({
    where: { id },
    select: SELECT_PLATAFORMA,
  });

  if (!plataforma) {
    throw new AppError(MSG.PLATAFORMA.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  return plataforma;
}

async function garantirNomeLivre(nome, ignorarId) {
  const existente = await prisma.plataforma.findUnique({
    where: { nome },
    select: { id: true },
  });

  if (existente && existente.id !== ignorarId) {
    throw new AppError(MSG.PLATAFORMA.NOME_JA_EXISTE, HTTP_STATUS.CONFLICT);
  }
}

// Duas gravações em simultâneo podem passar a verificação acima; a constraint da BD apanha-as
function tratarNomeDuplicado(erro) {
  if (erro && erro.code === "P2002") {
    throw new AppError(MSG.PLATAFORMA.NOME_JA_EXISTE, HTTP_STATUS.CONFLICT);
  }
  throw erro;
}

/**
 * Servidores e sistemas só existem em CLOUD_BASE_DADOS / CONTAINERIZACAO;
 * domínios só existem em GESTAO_DOMINIO. Mudar o tipo não pode deixar
 * registos num tipo que não os admite.
 */
function verificarMudancaDeTipo(atual, novoTipo) {
  const { dominios, servidores, infraestruturas } = atual._count;

  const incompativel =
    novoTipo === TIPO_GESTAO_DOMINIO
      ? servidores > 0 || infraestruturas > 0
      : dominios > 0;

  if (incompativel) {
    throw new AppError(MSG.PLATAFORMA.TIPO_INCOMPATIVEL, HTTP_STATUS.CONFLICT);
  }
}

async function listarPlataformas() {
  const plataformas = await prisma.plataforma.findMany({
    select: SELECT_PLATAFORMA,
    orderBy: [{ tipo: "asc" }, { nome: "asc" }],
  });

  return plataformas.map(formatar);
}

async function obterPlataforma(id) {
  return formatar(await obterPlataformaOuFalhar(id));
}

async function criarPlataforma(dados, usuarioId) {
  await garantirNomeLivre(dados.nome);

  try {
    return await prisma.$transaction(async (tx) => {
      const criada = await tx.plataforma.create({
        data: dados, // já validado e limpo pelo Zod
        select: SELECT_PLATAFORMA,
      });

      await atividadeService.registrar(tx, {
        usuarioId,
        acao: `Criou a plataforma "${criada.nome}" (${ROTULO_TIPO[criada.tipo]})`,
      });

      return formatar(criada);
    });
  } catch (erro) {
    return tratarNomeDuplicado(erro);
  }
}

async function atualizarPlataforma(id, dados, usuarioId) {
  const atual = await obterPlataformaOuFalhar(id);

  if (dados.nome !== undefined) {
    await garantirNomeLivre(dados.nome, id);
  }

  if (dados.tipo !== undefined && dados.tipo !== atual.tipo) {
    verificarMudancaDeTipo(atual, dados.tipo);
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const atualizada = await tx.plataforma.update({
        where: { id },
        data: dados,
        select: SELECT_PLATAFORMA,
      });

      await atividadeService.registrar(tx, {
        usuarioId,
        acao: `Atualizou a plataforma "${atualizada.nome}"`,
      });

      return formatar(atualizada);
    });
  } catch (erro) {
    return tratarNomeDuplicado(erro);
  }
}

async function apagarPlataforma(id, usuarioId) {
  const atual = await obterPlataformaOuFalhar(id);
  const { dominios, servidores, infraestruturas } = atual._count;

  if (dominios + servidores + infraestruturas > 0) {
    throw new AppError(MSG.PLATAFORMA.TEM_DEPENDENCIAS, HTTP_STATUS.CONFLICT);
  }

  return prisma.$transaction(async (tx) => {
    await tx.plataforma.delete({ where: { id } });

    await atividadeService.registrar(tx, {
      usuarioId,
      acao: `Apagou a plataforma "${atual.nome}" (${ROTULO_TIPO[atual.tipo]})`,
    });
  });
}

module.exports = {
  listarPlataformas,
  obterPlataforma,
  criarPlataforma,
  atualizarPlataforma,
  apagarPlataforma,
};