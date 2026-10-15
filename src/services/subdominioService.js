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



// Monta o registo DNS a partir do que o formulário do sistema envia.
// A / AAAA apontam para o servidor da infraestrutura; os restantes usam "destino".
function montarEstadoDaInfraestrutura(subdominio, servidorId) {
  const apontaParaServidor = TIPOS_COM_SERVIDOR.includes(subdominio.tipoDns);

  return {
    dominioId: subdominio.dominioId,
    nome: subdominio.nome,
    tipoDns: subdominio.tipoDns,
    servidorId: apontaParaServidor ? servidorId : null,
    destino: apontaParaServidor ? null : (subdominio.destino ?? null),
  };
}

// ignorarId = id do subdomínio que esta infraestrutura já tem (se existir)
async function validarParaInfraestrutura(estado, ignorarId) {
  await obterDominioOuFalhar(estado.dominioId);
  validarCoerencia(estado);
  await garantirRegistoLivre(estado, ignorarId);
  await garantirSemConflitoCname(estado, ignorarId);
}

module.exports = {
  listarSubdominios,
  obterSubdominio,
  montarEstadoDaInfraestrutura,
  validarParaInfraestrutura,
  tratarRegistoDuplicado,
  montarNomeCompleto,

};