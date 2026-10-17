const { z } = require("zod");
const { subdominioDaInfraestruturaSchema } = require("./subdominioValidator");

const AMBIENTES = ["PRODUCAO", "TESTES"];

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

const INT_MAX = 2147483647; // limite da coluna INT do MySQL

// ---------------------------------------------------------------------------
// Parâmetros de rota (req.params)
// ---------------------------------------------------------------------------

const idSchema = z.coerce
  .number({ error: "Identificador inválido." })
  .int("Identificador inválido.")
  .positive("Identificador inválido.");

const ambienteSchema = z.enum(AMBIENTES, {
  error: "Ambiente inválido. Use PRODUCAO ou TESTES.",
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
// Body: salvarInfraestrutura (PUT /:sistemaId/infraestruturas/:ambiente)
// ---------------------------------------------------------------------------
//
// A plataforma é obrigatória. O servidor e a imagem são opcionais. As regras que
// dependem da base de dados (o servidor pertence à plataforma, a imagem só existe
// em plataformas de containerização) são verificadas no service.

const plataformaIdSchema = z
  .number({ error: "A plataforma é obrigatória e deve ser um número." })
  .int("A plataforma é inválida.")
  .positive("A plataforma é inválida.")
  .max(INT_MAX, "A plataforma é inválida.");

const servidorIdSchema = z
  .number({ error: "O servidor deve ser um número." })
  .int("O servidor é inválido.")
  .positive("O servidor é inválido.")
  .max(INT_MAX, "O servidor é inválido.")
  .nullable()
  .optional();

const imagemIdSchema = z
  .number({ error: "A imagem deve ser um número." })
  .int("A imagem é inválida.")
  .positive("A imagem é inválida.")
  .max(INT_MAX, "A imagem é inválida.")
  .nullable()
  .optional();

const salvarInfraestruturaSchema = z.object({
  plataformaId: plataformaIdSchema,
  servidorId: servidorIdSchema,
  imagemId: imagemIdSchema,

  url: z
    .string({ error: "O URL deve ser texto." })
    .trim()
    .url("O URL é inválido.")
    .max(255, "O URL não pode ter mais de 255 caracteres.")
    .nullable()
    .optional(),

  // undefined = não mexer no subdomínio | null = remover | objeto = criar/atualizar
  subdominio: subdominioDaInfraestruturaSchema.nullable().optional(),
});

// ---------------------------------------------------------------------------
// Body: credenciais
// ---------------------------------------------------------------------------

const credencialSchema = z.object({
  tipo: z.enum(TIPOS_CREDENCIAL, { error: "Tipo de credencial inválido." }),
  label: z
    .string()
    .min(2, "O rótulo deve ter pelo menos 2 caracteres.")
    .max(255),
  valor: z.string().min(1, "O valor é obrigatório."),
});

const credencialUpdateSchema = credencialSchema.partial().refine(
  (dados) => Object.keys(dados).length > 0,
  { error: "Indique pelo menos um campo para atualizar." }
);

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