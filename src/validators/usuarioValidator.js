const { z } = require("zod");
const ROLES = require("../constants/roles");

const createUserSchema = z.object({
    nome: z.string().trim().min(3, "O nome deve ter pelo menos 3 caracteres."),
    email: z.email("Email inválido."),
    senha: z.string().min(8, "A palavra-passe deve ter pelo menos 8 caracteres."),
    numero: z.string().trim().min(9, "Número inválido."),
    cargo: z.string().trim().min(2, "Cargo é obrigatório."),
    perfil: z.enum([ROLES.ADMIN, ROLES.FUNCIONARIO])
});

module.exports = {
    createUserSchema
};