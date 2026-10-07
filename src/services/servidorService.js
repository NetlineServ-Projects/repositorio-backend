const net = require("net");
const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const MSG = require("../utils/messages");
const HTTP_STATUS = require("../utils/httpsStatus");
const { encriptar, desencriptar, hashIp } = require("../utils/crypto");
const atividadeService = require("./atividadeService");

// Só estes tipos de plataforma podem ter servidores
const TIPOS_COM_SERVIDORES = ["CLOUD_BASE_DADOS", "CONTAINERIZACAO"];

// Seleção pública: NUNCA inclui passwordCifrada nem ipHash.
// O ipCifrado é lido só para ser desencriptado em formatar().
const SELECT_SERVIDOR = {
  id: true,
  nome: true,
  hostname: true,
  ipCifrado: true,
  usernameSsh: true,
  numeroCpu: true,
  memoriaRam: true,
  memoriaRamUnidade: true,
  disco: true,
  discoUnidade: true,
  larguraBanda: true,
  larguraBandaUnidade: true,
  sistemaOperativo: true,
  versaoSo: true,
  cloud: true,
  regiao: true,
  plataformaId: true,
  plataforma: { select: { id: true, nome: true, tipo: true } },
  criadoEm: true,
  atualizadoEm: true,
  _count: { select: { subdominios: true, infraestruturas: true } },
};

// Uso interno (validações): acrescenta o ipHash, que nunca sai deste ficheiro
const SELECT_INTERNO = { ...SELECT_SERVIDOR, ipHash: true };

/**
 * Evita que um erro nativo de desencriptação (com stack trace) chegue ao cliente.
 * Campos vazios devolvem null.
 */
function desencriptarOuFalhar(valorEncriptado, contexto) {
  if (valorEncriptado === null || valorEncriptado === undefined) {
    return null;
  }

  try {
    return desencriptar(valorEncriptado);
  } catch (erro) {
    throw new AppError(
      `Não foi possível desencriptar ${contexto}. Verifique a chave de encriptação.`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * Forma canónica do IP, para encriptar e calcular o hash sempre sobre o mesmo texto.
 * IPv6 tem várias grafias para o mesmo endereço (ex: "::1" e "0:0:0:0:0:0:0:1").
 */
function normalizarIp(ip) {
  const valor = ip.trim();

  if (net.isIPv6(valor)) {
    return new URL(`http://[${valor}]`).hostname.slice(1, -1);
  }

  return valor;
}

/** Devolve o servidor pronto para a resposta: IP legível, sem campos internos. */
function formatar(servidor) {
  const { ipCifrado, ipHash, _count, ...resto } = servidor;

  return {
    ...resto,
    ip: desencriptarOuFalhar(ipCifrado, "o IP do servidor"),
    totais: {
      subdominios: _count.subdominios,
      sistemas: _count.infraestruturas,
    },
  };
}

async function obterInternoOuFalhar(id) {
  const servidor = await prisma.servidor.findUnique({
    where: { id },
    select: SELECT_INTERNO,
  });

  if (!servidor) {
    throw new AppError(MSG.SERVIDOR.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  return servidor;
}

async function garantirPlataformaValida(plataformaId) {
  const plataforma = await prisma.plataforma.findUnique({
    where: { id: plataformaId },
    select: { id: true, tipo: true, ativo: true },
  });

  if (!plataforma) {
    throw new AppError(MSG.PLATAFORMA.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  if (!TIPOS_COM_SERVIDORES.includes(plataforma.tipo)) {
    throw new AppError(MSG.SERVIDOR.PLATAFORMA_INVALIDA, HTTP_STATUS.CONFLICT);
  }

  if (!plataforma.ativo) {
    throw new AppError(MSG.SERVIDOR.PLATAFORMA_INATIVA, HTTP_STATUS.CONFLICT);
  }
}

async function garantirIpLivre(plataformaId, ipHash, ignorarId) {
  const existente = await prisma.servidor.findUnique({
    where: { plataformaId_ipHash: { plataformaId, ipHash } },
    select: { id: true },
  });

  if (existente && existente.id !== ignorarId) {
    throw new AppError(MSG.SERVIDOR.IP_JA_EXISTE, HTTP_STATUS.CONFLICT);
  }
}

// Duas gravações em simultâneo podem passar a verificação acima; a constraint da BD apanha-as
function tratarIpDuplicado(erro) {
  if (erro && erro.code === "P2002") {
    throw new AppError(MSG.SERVIDOR.IP_JA_EXISTE, HTTP_STATUS.CONFLICT);
  }
  throw erro;
}

async function listarServidores() {
  const servidores = await prisma.servidor.findMany({
    select: SELECT_SERVIDOR,
    orderBy: [{ plataforma: { nome: "asc" } }, { nome: "asc" }],
  });

  return servidores.map(formatar);
}

async function obterServidor(id) {
  const servidor = await prisma.servidor.findUnique({
    where: { id },
    select: SELECT_SERVIDOR,
  });

  if (!servidor) {
    throw new AppError(MSG.SERVIDOR.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  return formatar(servidor);
}

async function criarServidor(dados, usuarioId) {
  const { password, ip, ...resto } = dados;

  await garantirPlataformaValida(resto.plataformaId);

  const ipNormalizado = normalizarIp(ip);
  const ipHash = hashIp(ipNormalizado);
  await garantirIpLivre(resto.plataformaId, ipHash);

  try {
    return await prisma.$transaction(async (tx) => {
      const criado = await tx.servidor.create({
        data: {
          ...resto,
          ipCifrado: encriptar(ipNormalizado),
          ipHash,
          passwordCifrada: encriptar(password),
        },
        select: SELECT_SERVIDOR,
      });

      await atividadeService.registrar(tx, {
        usuarioId,
        acao: `Criou o servidor "${criado.nome}" na plataforma "${criado.plataforma.nome}"`,
      });

      return formatar(criado);
    });
  } catch (erro) {
    return tratarIpDuplicado(erro);
  }
}

async function atualizarServidor(id, dados, usuarioId) {
  const { password, ip, ...resto } = dados;
  const atual = await obterInternoOuFalhar(id);

  if (resto.plataformaId !== undefined && resto.plataformaId !== atual.plataformaId) {
    await garantirPlataformaValida(resto.plataformaId);
  }

  const data = { ...resto };
  let ipHashDestino = atual.ipHash;

  if (ip !== undefined) {
    const ipNormalizado = normalizarIp(ip);
    data.ipCifrado = encriptar(ipNormalizado);
    data.ipHash = hashIp(ipNormalizado);
    ipHashDestino = data.ipHash;
  }

  if (password !== undefined) {
    data.passwordCifrada = encriptar(password);
  }

  // O IP tem de continuar único na plataforma de destino (mudou o IP e/ou a plataforma)
  if (ip !== undefined || resto.plataformaId !== undefined) {
    await garantirIpLivre(resto.plataformaId ?? atual.plataformaId, ipHashDestino, id);
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const atualizado = await tx.servidor.update({
        where: { id },
        data,
        select: SELECT_SERVIDOR,
      });

      await atividadeService.registrar(tx, {
        usuarioId,
        acao: `Atualizou o servidor "${atualizado.nome}"${password !== undefined ? " (incluindo a password)" : ""}`,
      });

      return formatar(atualizado);
    });
  } catch (erro) {
    return tratarIpDuplicado(erro);
  }
}

async function apagarServidor(id, usuarioId) {
  const atual = await obterInternoOuFalhar(id);

  if (atual._count.subdominios + atual._count.infraestruturas > 0) {
    throw new AppError(MSG.SERVIDOR.TEM_DEPENDENCIAS, HTTP_STATUS.CONFLICT);
  }

  return prisma.$transaction(async (tx) => {
    await tx.servidor.delete({ where: { id } });

    await atividadeService.registrar(tx, {
      usuarioId,
      acao: `Apagou o servidor "${atual.nome}"`,
    });
  });
}

/**
 * Única forma de ler a password. Só deve ser chamada por uma rota protegida com
 * reautenticação (token elevado). Cada leitura fica auditada, sem guardar o valor.
 */
async function revelarPassword(id, usuarioId) {
  const servidor = await prisma.servidor.findUnique({
    where: { id },
    select: { id: true, nome: true, passwordCifrada: true },
  });

  if (!servidor) {
    throw new AppError(MSG.SERVIDOR.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  const password = desencriptarOuFalhar(servidor.passwordCifrada, "a password do servidor");

  await atividadeService.registrar(prisma, {
    usuarioId,
    acao: `Visualizou a password do servidor "${servidor.nome}"`,
  });

  return { password };
}

module.exports = {
  listarServidores,
  obterServidor,
  criarServidor,
  atualizarServidor,
  apagarServidor,
  revelarPassword,
};