const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const MSG = require("../utils/messages");
const HTTP_STATUS = require("../utils/httpsStatus");
const { encriptar, desencriptar } = require("../utils/crypto");
const atividadeService = require("./atividadeService");

const { rotuloAmbiente } = require("../utils/fileHelper");

/**
 * Confirma que o sistema existe e devolve o seu nome (usado nas mensagens de Atividade).
 */
async function obterSistemaOuFalhar(sistemaId) {
  const sistema = await prisma.sistema.findUnique({
    where: { id: sistemaId },
    select: { id: true, nome: true },
  });

  if (!sistema) {
    throw new AppError(MSG.SISTEMA.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  return sistema;
}

/**
 * Busca uma credencial garantindo que pertence ao sistema E ao ambiente do URL.
 * Sem esta verificação, um id de credencial de outro sistema/ambiente seria
 * aceite por qualquer caminho (IDOR). Não carrega o valorEncriptado.
 */
async function obterCredencialOuFalhar(credencialId, sistemaId, ambiente) {
  const credencial = await prisma.credencialSistema.findFirst({
    where: {
      id: credencialId,
      sistemaInfraestrutura: { sistemaId, ambiente },
    },
    select: { id: true, tipo: true, label: true },
  });

  if (!credencial) {
    throw new AppError(MSG.SISTEMA.CREDENCIAL_NAO_ENCONTRADA, HTTP_STATUS.NOT_FOUND);
  }

  return credencial;
}

/**
 * Envolve a chamada a desencriptar() para nunca deixar escapar um erro
 * nativo (com stack trace) até ao cliente — só um AppError limpo.
 * Campos ainda não preenchidos (ex.: infraestrutura criada só para guardar
 * credenciais, sem IP/cloud) devolvem null em vez de tentar desencriptar.
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
 * Lista os ambientes que já têm infraestrutura registada para o sistema.
 * Não devolve valores sensíveis (nada é desencriptado), por isso não gera
 * registo de atividade.
 */
async function listarInfraestruturas(sistemaId) {
  await obterSistemaOuFalhar(sistemaId);

  const infraestruturas = await prisma.sistemaInfraestrutura.findMany({
    where: { sistemaId },
    select: {
      id: true,
      ambiente: true,
      _count: { select: { credenciais: true } },
    },
    orderBy: { ambiente: "asc" },
  });

  return infraestruturas.map((i) => ({
    id: i.id,
    ambiente: i.ambiente,
    totalCredenciais: i._count.credenciais,
  }));
}

/**
 * Cria ou atualiza a infraestrutura de UM ambiente do sistema (upsert por
 * sistema + ambiente). Só o que vier definido é alterado.
 */
async function salvarInfraestrutura(sistemaId, ambiente, { ipServidor, cloudProvedor }, usuarioId) {
  const sistema = await obterSistemaOuFalhar(sistemaId);

  const dados = {
    ipServidor: ipServidor !== undefined ? encriptar(ipServidor) : undefined,
    cloudProvedor: cloudProvedor !== undefined ? encriptar(cloudProvedor) : undefined,
  };

  return prisma.$transaction(async (tx) => {
    const infraestrutura = await tx.sistemaInfraestrutura.upsert({
      where: { sistemaId_ambiente: { sistemaId, ambiente } },
      update: dados,
      create: { sistemaId, ambiente, ...dados },
      select: { id: true, ambiente: true }, // nunca devolver os valores encriptados sem necessidade
    });

    await atividadeService.registrar(tx, {
      usuarioId,
      acao: `Atualizou dados de infraestrutura (${rotuloAmbiente(ambiente)}) do sistema "${sistema.nome}"`,
      sistemaId,
    });

    return infraestrutura;
  });
}

/**
 * Leitura de UM ambiente, já desencriptado. Só deve ser chamada por uma rota
 * protegida com reautenticação (token elevado). Disponível para ADMIN e
 * FUNCIONARIO — a restrição de perfil só se aplica às operações de escrita.
 * Só se desencripta o ambiente pedido, e cada leitura fica auditada.
 */
async function obterInfraestrutura(sistemaId, ambiente, usuarioId) {
  const sistema = await obterSistemaOuFalhar(sistemaId);

  const infraestrutura = await prisma.sistemaInfraestrutura.findUnique({
    where: { sistemaId_ambiente: { sistemaId, ambiente } },
    include: { credenciais: true },
  });

  if (!infraestrutura) {
    return null; // ambiente ainda sem infraestrutura registada — não é erro
  }

  const resultado = {
    id: infraestrutura.id,
    ambiente: infraestrutura.ambiente,
    ipServidor: desencriptarOuFalhar(infraestrutura.ipServidor, "o IP do servidor"),
    cloudProvedor: desencriptarOuFalhar(infraestrutura.cloudProvedor, "o fornecedor de cloud"),
    credenciais: infraestrutura.credenciais.map((c) => ({
      id: c.id,
      tipo: c.tipo,
      label: c.label,
      valor: desencriptarOuFalhar(c.valorEncriptado, `a credencial "${c.label}"`),
    })),
  };

  await atividadeService.registrar(prisma, {
    usuarioId,
    acao: `Visualizou infraestrutura (${rotuloAmbiente(ambiente)}) do sistema "${sistema.nome}"`,
    sistemaId,
  });

  return resultado;
}

async function adicionarCredencial(sistemaId, ambiente, { tipo, label, valor }, usuarioId) {
  const sistema = await obterSistemaOuFalhar(sistemaId);

  return prisma.$transaction(async (tx) => {
    const infraestrutura = await tx.sistemaInfraestrutura.upsert({
      where: { sistemaId_ambiente: { sistemaId, ambiente } },
      update: {},
      create: { sistemaId, ambiente },
      select: { id: true },
    });

    const credencial = await tx.credencialSistema.create({
      data: {
        sistemaInfraestruturaId: infraestrutura.id,
        tipo,
        label,
        valorEncriptado: encriptar(valor),
      },
      select: { id: true, tipo: true, label: true }, // nunca devolver valorEncriptado na resposta de criação
    });

    await atividadeService.registrar(tx, {
      usuarioId,
      acao: `Adicionou credencial "${label}" (${tipo}) ao ambiente ${rotuloAmbiente(ambiente)} do sistema "${sistema.nome}"`,
      sistemaId,
    });

    return credencial;
  });
}

/**
 * Atualiza uma credencial existente do ambiente indicado. Todos os campos são
 * opcionais — só o que vier definido é alterado.
 */
async function atualizarCredencial(sistemaId, ambiente, credencialId, { tipo, label, valor }, usuarioId) {
  const sistema = await obterSistemaOuFalhar(sistemaId);
  await obterCredencialOuFalhar(credencialId, sistemaId, ambiente);

  return prisma.$transaction(async (tx) => {
    const credencial = await tx.credencialSistema.update({
      where: { id: credencialId },
      data: {
        tipo,
        label,
        valorEncriptado: valor !== undefined ? encriptar(valor) : undefined,
      },
      select: { id: true, tipo: true, label: true },
    });

    await atividadeService.registrar(tx, {
      usuarioId,
      acao: `Atualizou credencial "${credencial.label}" (${credencial.tipo}) do ambiente ${rotuloAmbiente(ambiente)} do sistema "${sistema.nome}"`,
      sistemaId: sistema.id,
    });

    return credencial;
  });
}

async function apagarCredencial(sistemaId, ambiente, credencialId, usuarioId) {
  const sistema = await obterSistemaOuFalhar(sistemaId);
  const credencial = await obterCredencialOuFalhar(credencialId, sistemaId, ambiente);

  return prisma.$transaction(async (tx) => {
    await tx.credencialSistema.delete({ where: { id: credencialId } });

    await atividadeService.registrar(tx, {
      usuarioId,
      acao: `Apagou credencial "${credencial.label}" (${credencial.tipo}) do ambiente ${rotuloAmbiente(ambiente)} do sistema "${sistema.nome}"`,
      sistemaId: sistema.id,
    });
  });
}

module.exports = {
  listarInfraestruturas,
  salvarInfraestrutura,
  obterInfraestrutura,
  adicionarCredencial,
  atualizarCredencial,
  apagarCredencial,
};