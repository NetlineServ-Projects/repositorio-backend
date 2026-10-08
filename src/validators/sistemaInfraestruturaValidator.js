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

const INT_MAX = 2147483647; // limite da coluna INT do MySQL

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
// Body — salvarInfraestrutura (PUT /:sistemaId/infraestruturas/:ambiente)
// ---------------------------------------------------------------------------
//
// Regra de negócio: tem de ter servidorId OU plataformaId, nunca os dois e
// nunca nenhum. Esta validação estrutural é feita aqui no Zod; a validação
// de existência (o servidor/plataforma realmente existe) fica no service.
//
// Num PATCH parcial a regra é verificada no service sobre o estado final
// (o que veio + o que já existia). Aqui usamos PUT (substitui tudo), por isso
// a coerência pode ser verificada directamente no schema.

const salvarInfraestruturaSchema = z
  .object({
    servidorId: z
      .number({ error: "O servidor deve ser um número." })
      .int("O servidor é inválido.")
      .positive("O servidor é inválido.")
      .max(INT_MAX, "O servidor é inválido.")
      .nullable()
      .optional(),

    plataformaId: z
      .number({ error: "A plataforma deve ser um número." })
      .int("A plataforma é inválida.")
      .positive("A plataforma é inválida.")
      .max(INT_MAX, "A plataforma é inválida.")
      .nullable()
      .optional(),

    url: z
      .string({ error: "O URL deve ser texto." })
      .trim()
      .url("O URL de produção é inválido.")
      .max(255, "O URL não pode ter mais de 255 caracteres.")
      .nullable()
      .optional(),
  })
  .refine(
    (dados) => {
      const temServidor   = dados.servidorId   != null;
      const temPlataforma = dados.plataformaId != null;
      // Exactamente um dos dois deve estar presente (XOR lógico)
      return temServidor !== temPlataforma;
    },
    {
      error:
        "Indique um servidor (servidorId) OU uma plataforma (plataformaId) — nunca os dois nem nenhum.",
    }
  );

// ---------------------------------------------------------------------------
// Body — credenciais
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
  { error: "Indique pelo menos um campo para actualizar." }
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