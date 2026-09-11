const prisma = require("../config/prisma");
const AppError = require("../errors/AppError"); // ajusta o caminho conforme onde a tua está
const { encriptar, desencriptar } = require("../utils/crypto");
const atividadeService = require("./atividadeService");

/**
 * Confirma que o sistema existe e devolve o seu nome (usado nas mensagens de Atividade).
 */
async function obterSistemaOuFalhar(sistemaId) {
  const sistema = await prisma.sistema.findUnique({
    where: { id: sistemaId },
    select: { id: true, nome: true },
  });

  if (!sistema) {
    throw new AppError("Sistema não encontrado.", 404);
  }

  return sistema;
}

/**
 * Busca uma credencial já com o nome do sistema associado (usado em
 * atualizar/apagar), sem carregar o valorEncriptado para memória à toa.
 */
async function obterCredencialOuFalhar(credencialId) {
  const credencial = await prisma.credencialSistema.findUnique({
    where: { id: credencialId },
    select: {
      id: true,
      tipo: true,
      label: true,
      sistemaInfraestrutura: {
        select: { sistema: { select: { id: true, nome: true } } },
      },
    },
  });

  if (!credencial) {
    throw new AppError("Credencial não encontrada.", 404);
  }

  return credencial;
}

/**
 * Envolve a chamada a desencriptar() para nunca deixar escapar um erro
 * nativo (com stack trace) até ao cliente — só um AppError limpo.
 */
function desencriptarOuFalhar(valorEncriptado, contexto) {
  try {
    return desencriptar(valorEncriptado);
  } catch (erro) {
    throw new AppError(
      `Não foi possível desencriptar ${contexto}. Verifique a chave de encriptação.`,
      500
    );
  }
}

/**
 * Etapa 4 — gravação segura de ipServidor/cloudProvedor.
 * Cria a SistemaInfraestrutura se ainda não existir (1-para-1 com Sistema).
 */
async function salvarInfraestrutura(sistemaId, { ipServidor, cloudProvedor }, usuarioId) {
  const sistema = await obterSistemaOuFalhar(sistemaId);

  return prisma.$transaction(async (tx) => {
    const infraestrutura = await tx.sistemaInfraestrutura.upsert({
      where: { sistemaId },
      update: {
        ipServidor: ipServidor !== undefined ? encriptar(ipServidor) : undefined,
        cloudProvedor: cloudProvedor !== undefined ? encriptar(cloudProvedor) : undefined,
      },
      create: {
        sistemaId,
        ipServidor: encriptar(ipServidor),
        cloudProvedor: encriptar(cloudProvedor),
      },
      select: { id: true }, // nunca devolver os valores encriptados sem necessidade
    });

    await atividadeService.registrar(tx, {
      usuarioId,
      acao: `Atualizou dados de infraestrutura do sistema "${sistema.nome}"`,
      sistemaId,
    });

    return infraestrutura;
  });
}

/**
 * Etapa 5 — leitura só deve ser chamada por uma rota já protegida com
 * ADMIN + reautenticação (token elevado). O service não valida isso;
 * isso é responsabilidade do middleware da rota (authMiddleware + exigirReautenticacao).
 */
async function obterInfraestrutura(sistemaId, usuarioId) {
  const sistema = await obterSistemaOuFalhar(sistemaId);

  const infraestrutura = await prisma.sistemaInfraestrutura.findUnique({
    where: { sistemaId },
    include: { credenciais: true },
  });

  if (!infraestrutura) {
    return null; // sistema ainda sem infraestrutura registada — não é erro
  }

  const resultado = {
    id: infraestrutura.id,
    ipServidor: desencriptarOuFalhar(infraestrutura.ipServidor, "o IP do servidor"),
    cloudProvedor: desencriptarOuFalhar(infraestrutura.cloudProvedor, "o fornecedor de cloud"),
    credenciais: infraestrutura.credenciais.map((c) => ({
      id: c.id,
      tipo: c.tipo,
      label: c.label,
      valor: desencriptarOuFalhar(c.valorEncriptado, `a credencial "${c.label}"`),
    })),
  };

  // Etapa 6 — cada leitura de dados sensíveis fica auditada
  await atividadeService.registrar(prisma, {
    usuarioId,
    acao: `Visualizou infraestrutura do sistema "${sistema.nome}"`,
    sistemaId,
  });

  return resultado;
}

async function adicionarCredencial(sistemaId, { tipo, label, valor }, usuarioId) {
  const sistema = await obterSistemaOuFalhar(sistemaId);

  return prisma.$transaction(async (tx) => {
    const infraestrutura = await tx.sistemaInfraestrutura.upsert({
      where: { sistemaId },
      update: {},
      create: { sistemaId },
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
      acao: `Adicionou credencial "${label}" (${tipo}) ao sistema "${sistema.nome}"`,
      sistemaId,
    });

    return credencial;
  });
}

/**
 * Atualiza uma credencial existente. Todos os campos são opcionais —
 * só o que vier definido é alterado (mesmo padrão usado em salvarInfraestrutura).
 */
async function atualizarCredencial(credencialId, { tipo, label, valor }, usuarioId) {
  const credencialExistente = await obterCredencialOuFalhar(credencialId);
  const { sistema } = credencialExistente.sistemaInfraestrutura;

  return prisma.$transaction(async (tx) => {
    const credencial = await tx.credencialSistema.update({
      where: { id: credencialId },
      data: {
        tipo: tipo !== undefined ? tipo : undefined,
        label: label !== undefined ? label : undefined,
        valorEncriptado: valor !== undefined ? encriptar(valor) : undefined,
      },
      select: { id: true, tipo: true, label: true },
    });

    await atividadeService.registrar(tx, {
      usuarioId,
      acao: `Atualizou credencial "${credencial.label}" (${credencial.tipo}) do sistema "${sistema.nome}"`,
      sistemaId: sistema.id,
    });

    return credencial;
  });
}

async function apagarCredencial(credencialId, usuarioId) {
  const credencial = await obterCredencialOuFalhar(credencialId);
  const { sistema } = credencial.sistemaInfraestrutura;

  return prisma.$transaction(async (tx) => {
    await tx.credencialSistema.delete({ where: { id: credencialId } });

    await atividadeService.registrar(tx, {
      usuarioId,
      acao: `Apagou credencial "${credencial.label}" (${credencial.tipo}) do sistema "${sistema.nome}"`,
      sistemaId: sistema.id,
    });
  });
}

module.exports = {
  salvarInfraestrutura,
  obterInfraestrutura,
  adicionarCredencial,
  atualizarCredencial,
  apagarCredencial,
};