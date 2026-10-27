const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const MSG = require("../utils/messages");
const HTTP_STATUS = require("../utils/httpsStatus");

// Só estes tipos apontam para um servidor; todos os outros guardam o valor em "destino"
const TIPOS_COM_SERVIDOR = ["A", "AAAA"];

const AMBIENTES = ["PRODUCAO", "TESTES"];

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
  sistemaId: true,
  ambiente: true,
  sistema: { select: { id: true, nome: true } },
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
 * Valida o ESTADO FINAL do registo:
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

// ─── Leitura (a página de Domínios mostra-os só para leitura) ────────────────

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

// ─── Subdomínios de um sistema (um por ambiente) ─────────────────────────────

/** A / AAAA apontam para o servidor; os restantes usam o destino. */
function montarEstado(pedido) {
  const usaServidor = TIPOS_COM_SERVIDOR.includes(pedido.tipoDns);

  return {
    dominioId: pedido.dominioId,
    nome: pedido.nome,
    tipoDns: pedido.tipoDns,
    servidorId: usaServidor ? (pedido.servidorId ?? null) : null,
    destino: usaServidor ? null : (pedido.destino ?? null),
  };
}

/**
 * Valida os subdomínios que vieram no pedido de um sistema e devolve o que há a gravar,
 * só com os ambientes enviados:
 *   ambiente omitido = não mexer | null = remover | objeto = criar ou atualizar.
 * sistemaId é null quando o sistema ainda não existe (criação).
 */
async function prepararSubdominiosDoSistema(sistemaId, subdominios) {
  const preparados = {};

  if (!subdominios) {
    return preparados;
  }

  for (const ambiente of AMBIENTES) {
    const pedido = subdominios[ambiente];

    if (pedido === undefined) {
      continue;
    }

    if (pedido === null) {
      preparados[ambiente] = null;
      continue;
    }

    const estado = montarEstado(pedido);

    await obterDominioOuFalhar(estado.dominioId);

    if (estado.servidorId !== null) {
      await garantirServidorExiste(estado.servidorId);
    }

    validarCoerencia(estado);

    const existente = sistemaId
      ? await prisma.subdominio.findUnique({
          where: { sistemaId_ambiente: { sistemaId, ambiente } },
          select: { id: true },
        })
      : null;

    await garantirRegistoLivre(estado, existente?.id);
    await garantirSemConflitoCname(estado, existente?.id);

    preparados[ambiente] = estado;
  }

  return preparados;
}

/** Grava o resultado de prepararSubdominiosDoSistema dentro da transação do sistema. */
async function gravarSubdominiosDoSistema(tx, sistemaId, preparados) {
  try {
    for (const ambiente of AMBIENTES) {
      if (!(ambiente in preparados)) {
        continue;
      }

      const estado = preparados[ambiente];

      if (estado === null) {
        await tx.subdominio.deleteMany({ where: { sistemaId, ambiente } });
        continue;
      }

      await tx.subdominio.upsert({
        where: { sistemaId_ambiente: { sistemaId, ambiente } },
        update: estado,
        create: { ...estado, sistemaId, ambiente },
      });
    }
  } catch (erro) {
    tratarRegistoDuplicado(erro);
  }
}

module.exports = {
  listarSubdominios,
  obterSubdominio,
  montarNomeCompleto,
  prepararSubdominiosDoSistema,
  gravarSubdominiosDoSistema,
}; 