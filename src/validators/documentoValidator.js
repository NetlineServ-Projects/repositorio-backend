const { z } = require("zod");

const createDocumentoSchema = z.object({
    titulo: z.string().trim().min(3, "O título deve ter pelo menos 3 caracteres."),
    descricao: z.string().trim().optional(),
    categoriaId: z.coerce.number().int().positive("Categoria inválida."),
    sistemaId: z.coerce.number().int().positive("Sistema inválido.").optional()
});

// Deriva o schema do PATCH tornando todos os campos opcionais
const updateDocumentoSchema = createDocumentoSchema.partial();

module.exports = {
    createDocumentoSchema
};