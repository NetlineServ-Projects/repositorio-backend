const { z } = require("zod");
const { subdominioDoSistemaSchema } = require("./subdominioValidator");

// Um subdomínio por ambiente. Ambiente omitido = não mexer | null = remover | objeto = criar ou atualizar
const subdominiosSchema = z
    .object({
        PRODUCAO: subdominioDoSistemaSchema.nullable().optional(),
        TESTES: subdominioDoSistemaSchema.nullable().optional(),
    })
    .optional();

const createSistemaSchema = z.object({
    nome: z.string().trim().min(2, "O nome do sistema é obrigatório."),
    desenvolvedores: z.array(z.string()).min(1, "Informe pelo menos um desenvolvedor."),
    empresasClientes: z.array(z.string()).optional(),
    descricaoCurta: z.string().trim().max(255).optional(),
    descricaoLonga: z.string().trim().optional(),
    dataInicio: z.coerce.date(),
    // nullable antes do coerce: sem isto, null passava a new Date(null) = 1970-01-01
    dataEntrega: z.coerce.date().nullable().optional(),
    status: z.enum(["Em Produção", "Em Desenvolvimento", "Manutenção"]).optional(),
    tecnologiasFrontend: z.array(z.string()).optional(),
    tecnologiasBackend: z.array(z.string()).optional(),
    tecnologiasInfraestrutura: z.array(z.string()).optional(),
    repositorioUrl: z.url("URL do repositório inválida.").optional(),
    // Só se usam quando o ambiente não tem subdomínio (ex: o endereço .vercel.app)
    urlProducao: z.url("URL de produção inválida.").optional(),
    urlTestes: z.url("URL de testes inválida.").nullable().optional(),
    plataformaFrontendId: z
        .number({ error: "A plataforma do frontend deve ser um número." })
        .int("A plataforma do frontend é inválida.")
        .positive("A plataforma do frontend é inválida.")
        .nullable()
        .optional(),
    subdominios: subdominiosSchema,
    responsavelTecnico: z.string().trim().optional(),
    versaoAtual: z.string().trim().optional(),
    ativo: z.boolean().optional(),
});

// Deriva o schema do PATCH tornando todos os campos opcionais
const updateSistemaSchema = createSistemaSchema.partial();

module.exports = {
    createSistemaSchema,
    updateSistemaSchema,
};