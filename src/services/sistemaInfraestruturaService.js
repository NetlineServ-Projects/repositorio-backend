const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const MSG = require("../utils/messages");
const HTTP_STATUS = require("../utils/httpsStatus");
const { encriptar, desencriptar } = require("../utils/crypto");
const atividadeService = require("./atividadeService");
const { rotuloAmbiente } = require("../utils/fileHelper");
const subdominioService = require("./subdominioService");

const TIPO_PLATAFORMA_GESTAO_DOMINIO = "GESTAO_DOMINIO";
const TIPO_PLATAFORMA_CONTAINERIZACAO = "CONTAINERIZACAO";

// ─── SELECT PÚBLICO DA INFRAESTRUTURA ────────────────────────────────────────
// Nunca inclui campos encriptados na listagem, só no obter individual.

const SELECT_INFRA_LISTA = {
  id: true,
  ambiente: true,
  url: true,
  plataformaId: true,
  plataforma: {
    select: { id: true, nome: true, tipo: true, fornecedor: true, logotipo: true },
  },
  servidorId: true,
  servidor: { select: { id: true, nome: true, hostname: true } },
  imagemId: true,
  imagem: { select: { id: true, nome: true, tag: true } },
  subdominio: {
    select: {
      id: true,
      nome: true,
      tipoDns: true,
      destino: true,
      dominio: { select: { id: true, nome: true } },
    },
  },
  criadoEm: true,
  atualizadoEm: true,
  _count: { select: { credenciais: true } },
};

// ─── HELPERS INTERNOS ────────────────────────────────────────────────────────

/** Confirma que o sistema existe e devolve id + nome (usado nas Atividades). */
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
 * Regras da hospedagem do backend:
 *   - a plataforma é obrigatória, existe, está ativa e não é de gestão de domínio;
 *   - o servidor é opcional e tem de pertencer à plataforma escolhida;
 *   - a imagem é opcional, só existe em plataformas de containerização e tem de
 *     pertencer à plataforma escolhida.
 */
async function validarHospedagem({ plataformaId, servidorId, imagemId }) {
  const plataforma = await prisma.plataforma.findUnique({
    where: { id: plataformaId },
    select: { id: true, tipo: true, ativo: true },
  });

  if (!plataforma) {
    throw new AppError(MSG.PLATAFORMA.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  if (plataforma.tipo === TIPO_PLATAFORMA_GESTAO_DOMINIO) {
    throw new AppError(MSG.SISTEMA.INFRA_PLATAFORMA_INVALIDA, HTTP_STATUS.CONFLICT);
  }

  if (!plataforma.ativo) {
    throw new AppError(MSG.SERVIDOR.PLATAFORMA_INATIVA, HTTP_STATUS.CONFLICT);
  }

  if (servidorId !== null) {
    const servidor = await prisma.servidor.findUnique({
      where: { id: servidorId },
      select: { id: true, plataformaId: true },
    });

    if (!servidor) {
      throw new AppError(MSG.SERVIDOR.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (servidor.plataformaId !== plataformaId) {
      throw new AppError(
        MSG.SISTEMA.INFRA_SERVIDOR_FORA_DA_PLATAFORMA,
        HTTP_STATUS.UNPROCESSABLE_ENTITY
      );
    }
  }

  if (imagemId !== null) {
    if (plataforma.tipo !== TIPO_PLATAFORMA_CONTAINERIZACAO) {
      throw new AppError(
        MSG.SISTEMA.INFRA_IMAGEM_SO_CONTAINERIZACAO,
        HTTP_STATUS.UNPROCESSABLE_ENTITY
      );
    }

    const imagem = await prisma.imagemContainer.findUnique({
      where: { id: imagemId },
      select: { id: true, plataformaId: true },
    });

    if (!imagem) {
      throw new AppError(MSG.SISTEMA.INFRA_IMAGEM_NAO_ENCONTRADA, HTTP_STATUS.NOT_FOUND);
    }

    if (imagem.plataformaId !== plataformaId) {
      throw new AppError(
        MSG.SISTEMA.INFRA_IMAGEM_FORA_DA_PLATAFORMA,
        HTTP_STATUS.UNPROCESSABLE_ENTITY
      );
    }
  }
}

function formatarSubdominio(infraestrutura) {
  const { subdominio } = infraestrutura;

  return {
    ...infraestrutura,
    subdominio: subdominio
      ? {
          ...subdominio,
          nomeCompleto: subdominioService.montarNomeCompleto(
            subdominio.nome,
            subdominio.dominio.nome
          ),
        }
      : null,
  };
}

/** Formata um registo de lista: substitui _count por totalCredenciais. */
function formatarInfra(infraestrutura) {
  const { _count, ...resto } = formatarSubdominio(infraestrutura);
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
    where: { sistemaId },
    select: SELECT_INFRA_LISTA,
    orderBy: { ambiente: "asc" },
  });

  return infraestruturas.map(formatarInfra);
}

/**
 * Cria ou atualiza a infraestrutura (backend) de UM ambiente: upsert por sistema + ambiente.
 * O subdomínio segue a regra: omitido = não mexer | null = remover | objeto = criar/atualizar.
 */
async function salvarInfraestrutura(sistemaId, ambiente, dados, usuarioId) {
  const sistema = await obterSistemaOuFalhar(sistemaId);

  const { plataformaId, servidorId = null, imagemId = null, url = null, subdominio } = dados;

  await validarHospedagem({ plataformaId, servidorId, imagemId });

  const chaveInfraestrutura = { sistemaId_ambiente: { sistemaId, ambiente } };

  let estadoSubdominio = null;

  if (subdominio) {
    const existente = await prisma.sistemaInfraestrutura.findUnique({
      where: chaveInfraestrutura,
      select: { subdominio: { select: { id: true } } },
    });

    estadoSubdominio = subdominioService.montarEstadoDaInfraestrutura(subdominio, servidorId);
    await subdominioService.validarParaInfraestrutura(estadoSubdominio, existente?.subdominio?.id);
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const infraestrutura = await tx.sistemaInfraestrutura.upsert({
        where: chaveInfraestrutura,
        update: { plataformaId, servidorId, imagemId, url },
        create: { sistemaId, ambiente, plataformaId, servidorId, imagemId, url },
        select: { id: true },
      });

      if (subdominio) {
        await tx.subdominio.upsert({
          where: { sistemaInfraestruturaId: infraestrutura.id },
          update: estadoSubdominio,
          create: { ...estadoSubdominio, sistemaInfraestruturaId: infraestrutura.id },
        });
      } else if (subdominio === null) {
        await tx.subdominio.deleteMany({
          where: { sistemaInfraestruturaId: infraestrutura.id },
        });
      }

      await atividadeService.registrar(tx, {
        usuarioId,
        acao: `Atualizou infraestrutura (${rotuloAmbiente(ambiente)}) do sistema "${sistema.nome}"`,
        sistemaId,
      });

      const completa = await tx.sistemaInfraestrutura.findUnique({
        where: { id: infraestrutura.id },
        select: SELECT_INFRA_LISTA,
      });

      return formatarInfra(completa);
    });
  } catch (erro) {
    return subdominioService.tratarRegistoDuplicado(erro);
  }
}

/**
 * Leitura completa de UM ambiente: inclui as credenciais desencriptadas.
 * Só deve ser chamada por uma rota com reautenticação (token elevado).
 * Cada leitura fica auditada.
 */
async function obterInfraestrutura(sistemaId, ambiente, usuarioId) {
  const sistema = await obterSistemaOuFalhar(sistemaId);

  const { _count, ...selectSemContagem } = SELECT_INFRA_LISTA;

  const infraestrutura = await prisma.sistemaInfraestrutura.findUnique({
    where: { sistemaId_ambiente: { sistemaId, ambiente } },
    select: {
      ...selectSemContagem,
      credenciais: {
        select: { id: true, tipo: true, label: true, valorEncriptado: true },
        orderBy: { criadoEm: "asc" },
      },
    },
  });

  if (!infraestrutura) {
    return null; // ainda sem infraestrutura registada: não é erro
  }

  const { credenciais, ...dadosInfraestrutura } = infraestrutura;

  const resultado = {
    ...formatarSubdominio(dadosInfraestrutura),
    credenciais: credenciais.map((c) => ({
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

/** Atualiza campos de uma credencial. Todos são opcionais: só o que vier é alterado. */
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
  obterCredencialOuFalhar,
};