const { z } = require("zod");

const loginSchema = z.object({
    email: z.email("Email inválido."),
    senha: z.string().min(1, "A palavra-passe é obrigatória.")
});

const alterarSenhaSchema = z.object({
    senhaAtual: z.string().min(1, "A palavra-passe atual é obrigatória."),
    novaSenha: z.string().min(8, "A nova palavra-passe deve ter pelo menos 8 caracteres.")
});

module.exports = {
    loginSchema,
    alterarSenhaSchema
};