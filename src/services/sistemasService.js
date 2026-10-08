const prisma = require("../config/prisma");
const MSG = require("../utils/messages");
const HTTP_STATUS = require("../utils/httpsStatus");
const AppError = require("../utils/AppError");
const { parseId } = require("../utils/fileHelper");
const atividadeService = require("./atividadeService");

// ─── SELECT EXPLÍCITO ────────────────────────────────────────────────────────
// Evita expor campos internos ou futuros acidentalmente.

const SELECT_SISTEMA_LISTA = {
    id: true,
    nome: true,
    descricaoCurta: true,
    status: true,
    dataInicio: true,
    dataEntrega: true,
    desenvolvedores: true,
    empresasClientes: true,
    tecnologiasFrontend: true,
    tecnologiasBackend: true,
    tecnologiasInfraestrutura: true,
    repositorioUrl: true,
    urlProducao: true,
    responsavelTecnico: true,
    versaoAtual: true,
    ativo: true,
    dataCriacao: true,
    _count: { select: { documentos: true } },
};

const SELECT_SISTEMA_DETALHE = {
    id: true,
    nome: true,
    descricaoCurta: true,
    descricaoLonga: true,
    status: true,
    dataInicio: true,
    dataEntrega: true,
    desenvolvedores: true,
    empresasClientes: true,
    tecnologiasFrontend: true,
    tecnologiasBackend: true,
    tecnologiasInfraestrutura: true,
    repositorioUrl: true,
    urlProducao: true,
    responsavelTecnico: true,
    versaoAtual: true,
    ativo: true,
    dataCriacao: true,
    documentos: {
        select: {
            id: true,
            titulo: true,
            tipoArquivo: true,
            estado: true,
            dataSubmissao: true,
        },
        // Limita a documentos não apagados
        where: { apagadoEm: null },
        orderBy: { dataSubmissao: "desc" },
        take: 50,
    },
};

// ─── HELPERS INTERNOS ────────────────────────────────────────────────────────

/**
 * Mapeamento de status legível (vindo do formulário) para o valor do enum Prisma.
 * O schema já tem @map nos enums, mas o formulário envia o rótulo visível.
 */
const STATUS_PARA_ENUM = {
    "Em Desenvolvimento": "EM_DESENVOLVIMENTO",
    "Em Produção":        "EM_PRODUCAO",
    "Manutenção":         "MANUTENCAO",
};

function mapearStatus(status) {
    return STATUS_PARA_ENUM[status] ?? "EM_DESENVOLVIMENTO";
}

/**
 * Constrói o objecto de dados normalizado para criar/actualizar um sistema.
 * Centraliza aqui toda a lógica de normalização para não repetir nos dois sítios.
 */
function montarDadosSistema(dados) {
    return {
        nome:                      dados.nome,
        descricaoCurta:            dados.descricaoCurta     ?? null,
        descricaoLonga:            dados.descricaoLonga     ?? null,
        status:                    mapearStatus(dados.status),
        dataInicio:                dados.dataInicio  ? new Date(dados.dataInicio)  : null,
        dataEntrega:               dados.dataEntrega ? new Date(dados.dataEntrega) : null,
        desenvolvedores:           dados.desenvolvedores           ?? [],
        empresasClientes:          dados.empresasClientes          ?? [],
        tecnologiasFrontend:       dados.tecnologiasFrontend       ?? [],
        tecnologiasBackend:        dados.tecnologiasBackend        ?? [],
        tecnologiasInfraestrutura: dados.tecnologiasInfraestrutura ?? [],
        repositorioUrl:            dados.repositorioUrl            ?? null,
        urlProducao:               dados.urlProducao               ?? null,
        responsavelTecnico:        dados.responsavelTecnico        ?? null,
        versaoAtual:               dados.versaoAtual               ?? null,
        ativo:                     dados.ativo !== undefined ? dados.ativo : true,
    };
}

/**
 * Formata um registo de lista — adiciona totalDocumentos e remove _count.
 */
function formatar(sistema) {
    const { _count, ...resto } = sistema;
    return {
        ...resto,
        totalDocumentos: _count?.documentos ?? 0,
    };
}

// Valida e converte o id do utilizador (pode vir como string de req.user)
function resolverUsuarioId(usuarioAtual) {
    if (!usuarioAtual) return null;
    return parseId(usuarioAtual.id, MSG.VALIDATION.INVALID_ID);
}

// ─── FUNÇÕES PÚBLICAS (exports funcionais — padrão do projecto) ──────────────

async function listarTodos() {
    const sistemas = await prisma.sistema.findMany({
        select: SELECT_SISTEMA_LISTA,
        orderBy: { dataCriacao: "desc" },
    });

    return sistemas.map(formatar);
}

async function obterPorId(id) {
    const idNum = parseId(id, MSG.VALIDATION.INVALID_ID);

    const sistema = await prisma.sistema.findUnique({
        where:  { id: idNum },
        select: SELECT_SISTEMA_DETALHE,
    });

    if (!sistema) {
        throw new AppError(MSG.SISTEMA.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return sistema;
}

// usuarioAtual precisa de { id } (vem de req.user no controller)
async function criar(dados, usuarioAtual) {
    const usuarioId = resolverUsuarioId(usuarioAtual);

    return prisma.$transaction(async (tx) => {
        const novoSistema = await tx.sistema.create({
            data:   montarDadosSistema(dados),
            select: SELECT_SISTEMA_LISTA,
        });

        if (usuarioId) {
            await atividadeService.registrar(tx, {
                usuarioId,
                acao:      `Criou o sistema "${novoSistema.nome}"`,
                sistemaId: novoSistema.id,
            });
        }

        return formatar(novoSistema);
    });
}

async function atualizar(id, dados, usuarioAtual) {
    const idNum      = parseId(id, MSG.VALIDATION.INVALID_ID);
    const usuarioId  = resolverUsuarioId(usuarioAtual);

    return prisma.$transaction(async (tx) => {
        const sistemaExiste = await tx.sistema.findUnique({
            where:  { id: idNum },
            select: { id: true, nome: true },
        });

        if (!sistemaExiste) {
            throw new AppError(MSG.SISTEMA.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
        }

        const sistemaAtualizado = await tx.sistema.update({
            where:  { id: idNum },
            data:   montarDadosSistema(dados),
            select: SELECT_SISTEMA_LISTA,
        });

        if (usuarioId) {
            await atividadeService.registrar(tx, {
                usuarioId,
                acao:      `Atualizou o sistema "${sistemaAtualizado.nome}"`,
                sistemaId: sistemaAtualizado.id,
            });
        }

        return formatar(sistemaAtualizado);
    });
}

async function apagar(id, usuarioAtual) {
    const idNum     = parseId(id, MSG.VALIDATION.INVALID_ID);
    const usuarioId = resolverUsuarioId(usuarioAtual);

    return prisma.$transaction(async (tx) => {
        const sistemaExiste = await tx.sistema.findUnique({
            where:  { id: idNum },
            select: { id: true, nome: true },
        });

        if (!sistemaExiste) {
            throw new AppError(MSG.SISTEMA.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
        }

        await tx.sistema.delete({ where: { id: idNum } });

        if (usuarioId) {
            // sistemaId fica de fora — o sistema já não existe depois do delete,
            // por isso o nome vai directamente no texto da acção.
            await atividadeService.registrar(tx, {
                usuarioId,
                acao: `Eliminou o sistema "${sistemaExiste.nome}"`,
            });
        }
    });
}

module.exports = {
    listarTodos,
    obterPorId,
    criar,
    atualizar,
    apagar,
};