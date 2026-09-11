const { z } = require("zod");

const reautenticarSchema = z.object({
  senha: z.string().min(1, "A password é obrigatória."),
});

const salvarInfraestruturaSchema = z.object({
  ipServidor: z.string().max(255).optional(),
  cloudProvedor: z.string().max(255).optional(),
});

const TIPOS_CREDENCIAL = [
  "ENV_VARIAVEIS",
  "CREDENCIAIS_BD",
  "CHAVE_TOKEN_API",
  "CHAVE_SSH",
  "CERTIFICADO_SSL",
  "CREDENCIAIS_DNS",
  "ACESSO_CONSOLA_CLOUD",
  "CREDENCIAIS_CICD",
  "CONFIGURACAO_VPN_FIREWALL",
  "CREDENCIAIS_SMTP",
  "BACKUP_ACESSO",
  "OUTRO",
];

const credencialSchema = z.object({
  tipo: z.enum(TIPOS_CREDENCIAL, { errorMap: () => ({ message: "Tipo de credencial inválido." }) }),
  label: z.string().min(2, "O rótulo deve ter pelo menos 2 caracteres.").max(255),
  valor: z.string().min(1, "O valor é obrigatório."),
});

const credencialUpdateSchema = credencialSchema.partial();

module.exports = {
  reautenticarSchema,
  salvarInfraestruturaSchema,
  credencialSchema,
  credencialUpdateSchema,
};