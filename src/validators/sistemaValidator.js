const { z } = require("zod");


const createSistemaSchema = z.object({
    nome: z.string().trim().min(2, "O nome do sistema é obrigatório."),
    desenvolvedores: z.array(z.string()).min(1, "Informe pelo menos um desenvolvedor."),
    empresasClientes: z.array(z.string()).optional(),
    descricaoCurta: z.string().trim().max(255).optional(),
    descricaoLonga: z.string().trim().optional(),
    dataInicio: z.coerce.date(),
    dataEntrega: z.coerce.date().optional(),
    status: z.enum(["Em Produção", "Em Desenvolvimento", "Manutenção"]).optional(),
    tecnologiasFrontend: z.array(z.string()).optional(),
    tecnologiasBackend: z.array(z.string()).optional(),
    tecnologiasInfraestrutura: z.array(z.string()).optional(),
    repositorioUrl: z.url("URL do repositório inválida.").optional(),
    urlProducao: z.url("URL de produção inválida.").optional(),
    responsavelTecnico: z.string().trim().optional(),
    versaoAtual: z.string().trim().optional(),
    ativo: z.boolean().optional()
});

module.exports = {
    createSistemaSchema
};