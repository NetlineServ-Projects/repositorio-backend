const { z } = require("zod");

const createSistemaSchema = z.object({
    nome: z.string().trim().min(2, "O nome do sistema é obrigatório."),
    desenvolvedores: z.array(z.string()).min(1, "Informe pelo menos um desenvolvedor."),
    empresasClientes: z.array(z.string()).optional(),
    descricaoCurta: z.string().trim().max(255).optional(),
    descricaoLonga: z.string().trim().optional(),
    dataInicio: z.coerce.date(),
    dataEntrega: z.coerce.date().optional(),
    status: z.enum(["EM_PRODUCAO", "EM_DESENVOLVIMENTO", "MANUTENCAO"]).optional(),
    tecnologias: z.array(z.string()).optional()
});

module.exports = {
    createSistemaSchema
};