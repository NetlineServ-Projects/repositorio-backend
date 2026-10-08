const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const MSG = require("../utils/messages");
const HTTP_STATUS = require("../utils/httpsStatus");
const atividadeService = require("./atividadeService");

// Só estes tipos apontam para um servidor; todos os outros guardam o valor em "destino"
const TIPOS_COM_SERVIDOR = ["A", "AAAA"];

const NOME_RAIZ = "@";

// Nome de domínio para o destino de um CNAME (aceita ponto final)
const NOME_DOMINIO_REGEX =
  /^(?=.{1,253}\.?$)[a-z0-9_]([a-z0-9_-]{0,61}[a-z0-9_])?(\.[a-z0-9_]([a-z0-9_-]{0,61}[a-z0-9_])?)*\.?$/i;

// O servidor aparece só com identificação: o IP e a password nunca saem daqui
const SELECT_SUBDOMINIO = {
  id: true,
  nome: true,
  tipoDns: true,
  destino: true,
  dominioId: true,
  dominio: { select: { id: true, nome: true } },
  servidorId: true,
  servidor: { select: { id: true, nome: true, hostname: true } },
  criadoEm: true,
  atualizadoEm: true,
};

function montarNomeCompleto(nome, nomeDominio) {
  return nome === NOME_RAIZ ? nomeDominio : `${nome}.${nomeDominio}`;
}

function formatar(subdominio) {
  return {
    ...subdominio,
    nomeCompleto: montarNomeCompleto(subdominio.nome, subdominio.dominio.nome),
  };
}

async function obterSubdominioOuFalhar(id) {
  const subdominio = await prisma.subdominio.findUnique({
    where: { id },
    select: SELECT_SUBDOMINIO,
  });

  if (!subdominio) {
    throw new AppError(MSG.SUBDOMINIO.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  return subdominio;
}

async function obterDominioOuFalhar(dominioId) {
  const dominio = await prisma.dominio.findUnique({
    where: { id: dominioId },
    select: { id: true, nome: true },
  });

  if (!dominio) {
    throw new AppError(MSG.DOMINIO.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  return dominio;
}

async function garantirServidorExiste(servidorId) {
  const servidor = await prisma.servidor.findUnique({
    where: { id: servidorId },
    select: { id: true },
  });

  if (!servidor) {
    throw new AppError(MSG.SERVIDOR.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }
}

/**
 * Valida o ESTADO FINAL do registo (num PATCH, já misturado com o que existia):
 *   A / AAAA        → servidorId obrigatório, sem destino
 *   todos os outros → destino obrigatório, sem servidorId
 */
function validarCoerencia({ tipoDns, servidorId, destino }) {
  const semServidor = servidorId === null || servidorId === undefined;
  const semDestino = destino === null || destino === undefined || destino === "";

  if (TIPOS_COM_SERVIDOR.includes(tipoDns)) {
    if (semServidor) {
      throw new AppError(MSG.SUBDOMINIO.SERVIDOR_OBRIGATORIO, HTTP_STATUS.UNPROCESSABLE_ENTITY);
    }
    if (!semDestino) {
      throw new AppError(MSG.SUBDOMINIO.DESTINO_NAO_PERMITIDO, HTTP_STATUS.UNPROCESSABLE_ENTITY);
    }
    return;
  }

  if (semDestino) {
    throw new AppError(MSG.SUBDOMINIO.DESTINO_OBRIGATORIO, HTTP_STATUS.UNPROCESSABLE_ENTITY);
  }
  if (!semServidor) {
    throw new AppError(MSG.SUBDOMINIO.SERVIDOR_NAO_PERMITIDO, HTTP_STATUS.UNPROCESSABLE_ENTITY);
  }
  if (tipoDns === "CNAME" && !NOME_DOMINIO_REGEX.test(destino)) {
    throw new AppError(MSG.SUBDOMINIO.CNAME_INVALIDO, HTTP_STATUS.UNPROCESSABLE_ENTITY);
  }
}

async function garantirRegistoLivre({ dominioId, nome, tipoDns }, ignorarId) {
  const existente = await prisma.subdominio.findUnique({
    where: { dominioId_nome_tipoDns: { dominioId, nome, tipoDns } },
    select: { id: true },
  });

  if (existente && existente.id !== ignorarId) {
    throw new AppError(MSG.SUBDOMINIO.JA_EXISTE, HTTP_STATUS.CONFLICT);
  }
}

/**
 * Regra do DNS: um nome com CNAME não pode ter outros registos, e vice-versa.
 * A raiz ("@") fica de fora, porque alguns fornecedores (ex.: Cloudflare)
 * permitem um CNAME na raiz ao lado de outros registos.
 */
async function garantirSemConflitoCname({ dominioId, nome, tipoDns }, ignorarId) {
  if (nome === NOME_RAIZ) {
    return;
  }

  const filtroOutroRegisto = ignorarId !== undefined ? { id: { not: ignorarId } } : {};

  const conflito = await prisma.subdominio.count({
    where: {
      dominioId,
      nome,
      ...filtroOutroRegisto,
      ...(tipoDns === "CNAME" ? {} : { tipoDns: "CNAME" }),
    },
  });

  if (conflito > 0) {
    throw new AppError(MSG.SUBDOMINIO.CNAME_CONFLITO, HTTP_STATUS.CONFLICT);
  }
}

// Duas gravações em simultâneo podem passar as verificações acima; a constraint da BD apanha-as
function tratarRegistoDuplicado(erro) {
  if (erro && erro.code === "P2002") {
    throw new AppError(MSG.SUBDOMINIO.JA_EXISTE, HTTP_STATUS.CONFLICT);
  }
  throw erro;
}

async function listarSubdominios() {
  const subdominios = await prisma.subdominio.findMany({
    select: SELECT_SUBDOMINIO,
    orderBy: [{ dominio: { nome: "asc" } }, { nome: "asc" }, { tipoDns: "asc" }],
  });

  return subdominios.map(formatar);
}

async function obterSubdominio(id) {
  return formatar(await obterSubdominioOuFalhar(id));
}

async function criarSubdominio(dados, usuarioId) {
  const estado = {
    dominioId: dados.dominioId,
    nome: dados.nome,
    tipoDns: dados.tipoDns,
    servidorId: dados.servidorId ?? null,
    destino: dados.destino ?? null,
  };

  await obterDominioOuFalhar(estado.dominioId);
  validarCoerencia(estado);

  if (estado.servidorId !== null) {
    await garantirServidorExiste(estado.servidorId);
  }

  await garantirRegistoLivre(estado);
  await garantirSemConflitoCname(estado);

  try {
    return await prisma.$transaction(async (tx) => {
      const criado = await tx.subdominio.create({
        data: estado,
        select: SELECT_SUBDOMINIO,
      });

      await atividadeService.registrar(tx, {
        usuarioId,
        acao: `Criou o subdomínio "${montarNomeCompleto(criado.nome, criado.dominio.nome)}" (${criado.tipoDns})`,
      });

      return formatar(criado);
    });
  } catch (erro) {
    return tratarRegistoDuplicado(erro);
  }
}

async function atualizarSubdominio(id, dados, usuarioId) {
  const atual = await obterSubdominioOuFalhar(id);

  // Estado final: o que vem no pedido por cima do que já existia
  const estado = {
    dominioId: dados.dominioId !== undefined ? dados.dominioId : atual.dominioId,
    nome: dados.nome !== undefined ? dados.nome : atual.nome,
    tipoDns: dados.tipoDns !== undefined ? dados.tipoDns : atual.tipoDns,
    servidorId: dados.servidorId !== undefined ? dados.servidorId : atual.servidorId,
    destino: dados.destino !== undefined ? dados.destino : atual.destino,
  };

  if (estado.dominioId !== atual.dominioId) {
    await obterDominioOuFalhar(estado.dominioId);
  }

  validarCoerencia(estado);

  if (estado.servidorId !== null && estado.servidorId !== atual.servidorId) {
    await garantirServidorExiste(estado.servidorId);
  }

  await garantirRegistoLivre(estado, id);
  await garantirSemConflitoCname(estado, id);

  try {
    return await prisma.$transaction(async (tx) => {
      const atualizado = await tx.subdominio.update({
        where: { id },
        data: estado,
        select: SELECT_SUBDOMINIO,
      });

      await atividadeService.registrar(tx, {
        usuarioId,
        acao: `Atualizou o subdomínio "${montarNomeCompleto(atualizado.nome, atualizado.dominio.nome)}" (${atualizado.tipoDns})`,
      });

      return formatar(atualizado);
    });
  } catch (erro) {
    return tratarRegistoDuplicado(erro);
  }
}

async function apagarSubdominio(id, usuarioId) {
  const atual = await obterSubdominioOuFalhar(id);

  return prisma.$transaction(async (tx) => {
    await tx.subdominio.delete({ where: { id } });

    await atividadeService.registrar(tx, {
      usuarioId,
      acao: `Apagou o subdomínio "${montarNomeCompleto(atual.nome, atual.dominio.nome)}" (${atual.tipoDns})`,
    });
  });
}

module.exports = {
  listarSubdominios,
  obterSubdominio,
  criarSubdominio,
  atualizarSubdominio,
  apagarSubdominio,
};