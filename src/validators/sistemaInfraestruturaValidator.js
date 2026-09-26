const { z } = require("zod");

const AMBIENTES = ["PRODUCAO", "TESTES", "DESENVOLVIMENTO"];

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

// ---------------------------------------------------------------------------
// Parâmetros de rota (req.params)
// ---------------------------------------------------------------------------

const idSchema = z.coerce
  .number({ error: "Identificador inválido." })
  .int("Identificador inválido.")
  .positive("Identificador inválido.");

const ambienteSchema = z.enum(AMBIENTES, {
  error: "Ambiente inválido. Use PRODUCAO, TESTES ou DESENVOLVIMENTO.",
});

// /sistemas/:sistemaId/infraestruturas
const sistemaIdParamsSchema = z.object({
  sistemaId: idSchema,
});

// /sistemas/:sistemaId/infraestruturas/:ambiente
const infraestruturaParamsSchema = z.object({
  sistemaId: idSchema,
  ambiente: ambienteSchema,
});

// /sistemas/:sistemaId/infraestruturas/:ambiente/credenciais/:credencialId
const credencialParamsSchema = infraestruturaParamsSchema.extend({
  credencialId: idSchema,
});

// ---------------------------------------------------------------------------
// Body (req.body) — o ambiente vem do caminho, nunca do body
// ---------------------------------------------------------------------------

const salvarInfraestruturaSchema = z.object({
  ipServidor: z.string().max(255).optional(),
  cloudProvedor: z.string().max(255).optional(),
});

const credencialSchema = z.object({
  tipo: z.enum(TIPOS_CREDENCIAL, { error: "Tipo de credencial inválido." }),
  label: z
    .string()
    .min(2, "O rótulo deve ter pelo menos 2 caracteres.")
    .max(255),
  valor: z.string().min(1, "O valor é obrigatório."),
});

const credencialUpdateSchema = credencialSchema.partial();

module.exports = {
  AMBIENTES,
  TIPOS_CREDENCIAL,
  ambienteSchema,
  sistemaIdParamsSchema,
  infraestruturaParamsSchema,
  credencialParamsSchema,
  salvarInfraestruturaSchema,
  credencialSchema,
  credencialUpdateSchema,
};