const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const MSG = require("../utils/messages");
const HTTP_STATUS = require("../utils/httpsStatus");
const { encriptar, desencriptar } = require("../utils/crypto");
const atividadeService = require("./atividadeService");
const { rotuloAmbiente } = require("../utils/fileHelper");

// ─── SELECT PÚBLICO DA INFRAESTRUTURA ────────────────────────────────────────
// Nunca inclui campos encriptados na listagem — só no obter individual.

const SELECT_INFRA_LISTA = {
  id: true,
  ambiente: true,
  url: true,
  servidorId: true,
  servidor: { select: { id: true, nome: true, hostname: true } },
  plataformaId: true,
  plataforma: { select: { id: true, nome: true, tipo: true } },
  criadoEm: true,
  atualizadoEm: true,
  _count: { select: { credenciais: true } },
};

// ─── HELPERS INTERNOS ────────────────────────────────────────────────────────

/**
 * Confirma que o sistema existe e devolve id + nome (usado nas Atividades).
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
 * Envolve desencriptar() para nunca deixar escapar um stack trace até ao cliente.
 * Campos nulos devolvem null sem tentar desencriptar.
 */
function desencriptarOuFalhar(valorEncriptado, contexto) {
  if (valorEncriptado === null || valorEncriptado === undefined) return null;

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
 * Valida a regra de negócio: tem de ter servidorId OU plataformaId, nunca os dois
 * nem nenhum. É chamada no salvar para garantir a coerência do estado final.
 * (O Zod no PUT já valida o body, mas confirmamos também no service para segurança.)
 */
function validarServidorOuPlataforma({ servidorId, plataformaId }) {
  const temServidor   = servidorId   != null;
  const temPlataforma = plataformaId != null;

  if (!temServidor && !temPlataforma) {
    throw new AppError(
      MSG.SISTEMA.INFRA_SERVIDOR_OU_PLATAFORMA,
      HTTP_STATUS.UNPROCESSABLE_ENTITY
    );
  }

  if (temServidor && temPlataforma) {
    throw new AppError(
      MSG.SISTEMA.INFRA_NAO_AMBOS,
      HTTP_STATUS.UNPROCESSABLE_ENTITY
    );
  }
}

/**
 * Confirma que o servidor existe (e pertence a uma plataforma com servidores).
 */
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
 * Confirma que a plataforma existe e é do tipo que pode receber sistemas directamente
 * (sem servidor próprio, ex: Vercel). Só plataformas sem servidores é que se ligam
 * directamente à infraestrutura.
 * Regra: GESTAO_DOMINIO não pode receber sistemas directamente.
 */
async function garantirPlataformaParaSistema(plataformaId) {
  const plataforma = await prisma.plataforma.findUnique({
    where: { id: plataformaId },
    select: { id: true, tipo: true, ativo: true },
  });

  if (!plataforma) {
    throw new AppError(MSG.PLATAFORMA.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  if (plataforma.tipo === "GESTAO_DOMINIO") {
    throw new AppError(
      MSG.SISTEMA.INFRA_PLATAFORMA_INVALIDA,
      HTTP_STATUS.CONFLICT
    );
  }

  if (!plataforma.ativo) {
    throw new AppError(MSG.SERVIDOR.PLATAFORMA_INATIVA, HTTP_STATUS.CONFLICT);
  }
}

/**
 * Formata um registo de lista: substitui _count por totalCredenciais.
 */
function formatarInfra(i) {
  const { _count, ...resto } = i;
  return { ...resto, totalCredenciais: _count.credenciais };
}

// ─── FUNÇÕES PÚBLICAS ────────────────────────────────────────────────────────

/**
 * Lista os ambientes que já têm infraestrutura registada para o sistema.
 * Não devolve campos encriptados; não gera auditoria.
 */
async function listarInfraestruturas(sistemaId) {
  await obterSistemaOuFalhar(sistemaId);

  const infraestruturas = await prisma.sistemaInfraestrutura.findMany({
    where:   { sistemaId },
    select:  SELECT_INFRA_LISTA,
    orderBy: { ambiente: "asc" },
  });

  return infraestruturas.map(formatarInfra);
}

/**
 * Cria ou actualiza a infraestrutura de UM ambiente (upsert por sistema + ambiente).
 *
 * Regra: tem de ter servidorId XOR plataformaId. O Zod valida o body (PUT completo),
 * e o service confirma a coerência antes de gravar.
 */
async function salvarInfraestrutura(sistemaId, ambiente, dados, usuarioId) {
  const sistema = await obterSistemaOuFalhar(sistemaId);

  const { servidorId = null, plataformaId = null, url = null } = dados;

  // Valida a regra XOR no service (defesa em profundidade)
  validarServidorOuPlataforma({ servidorId, plataformaId });

  // Confirma que a FK existe na base de dados
  if (servidorId !== null) {
    await garantirServidorExiste(servidorId);
  } else {
    await garantirPlataformaParaSistema(plataformaId);
  }

  return prisma.$transaction(async (tx) => {
    const infraestrutura = await tx.sistemaInfraestrutura.upsert({
      where:  { sistemaId_ambiente: { sistemaId, ambiente } },
      update: { servidorId, plataformaId, url },
      create: { sistemaId, ambiente, servidorId, plataformaId, url },
      select: SELECT_INFRA_LISTA,
    });

    await atividadeService.registrar(tx, {
      usuarioId,
      acao: `Atualizou infraestrutura (${rotuloAmbiente(ambiente)}) do sistema "${sistema.nome}"`,
      sistemaId,
    });

    return formatarInfra(infraestrutura);
  });
}

/**
 * Leitura completa de UM ambiente — inclui credenciais desencriptadas e url/servidor/plataforma.
 * Só deve ser chamada por uma rota com reautenticação (token elevado).
 * Cada leitura fica auditada.
 */
async function obterInfraestrutura(sistemaId, ambiente, usuarioId) {
  const sistema = await obterSistemaOuFalhar(sistemaId);

  const infraestrutura = await prisma.sistemaInfraestrutura.findUnique({
    where: { sistemaId_ambiente: { sistemaId, ambiente } },
    select: {
      id:          true,
      ambiente:    true,
      url:         true,
      servidorId:  true,
      servidor:    { select: { id: true, nome: true, hostname: true } },
      plataformaId: true,
      plataforma:  { select: { id: true, nome: true, tipo: true } },
      criadoEm:    true,
      atualizadoEm: true,
      credenciais: {
        select: { id: true, tipo: true, label: true, valorEncriptado: true },
        orderBy: { criadoEm: "asc" },
      },
    },
  });

  if (!infraestrutura) {
    return null; // ambiente ainda sem infraestrutura registada — não é erro
  }

  const { credenciais, ...resto } = infraestrutura;

  const resultado = {
    ...resto,
    credenciais: credenciais.map((c) => ({
      id:    c.id,
      tipo:  c.tipo,
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
    // Garante que a infraestrutura existe (pode ter sido criada sem credenciais)
    // sem alterar nada se já existir (update: {})
    const infraestrutura = await tx.sistemaInfraestrutura.findUnique({
      where: { sistemaId_ambiente: { sistemaId, ambiente } },
      select: { id: true },
    });

    if (!infraestrutura) {
      throw new AppError(MSG.SISTEMA.INFRA_NAO_ENCONTRADA, HTTP_STATUS.NOT_FOUND);
    }

    const credencial = await tx.credencialSistema.create({
      data: {
        sistemaInfraestruturaId: infraestrutura.id,
        tipo,
        label,
        valorEncriptado: encriptar(valor),
      },
      select: { id: true, tipo: true, label: true, criadoEm: true },
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
 * Atualiza campos de uma credencial. Todos são opcionais — só o que vier é alterado.
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
      select: { id: true, tipo: true, label: true, atualizadoEm: true },
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
  const sistema    = await obterSistemaOuFalhar(sistemaId);
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