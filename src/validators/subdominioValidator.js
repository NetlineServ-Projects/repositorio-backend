const { z } = require("zod");

const INT_MAX = 2147483647; // limite da coluna INT do MySQL

const TIPOS_DNS = [
  "A", "AAAA", "CNAME", "MX", "TXT", "NS", "SRV", "CAA",
  "PTR", "SOA", "DS", "DNSKEY", "RRSIG", "TLSA", "SSHFP", "OUTRO",
];

// "@" (raiz do domínio) ou uma ou mais etiquetas separadas por pontos.
// Aceita "_" (usado em _dmarc, _domainkey, _sip...) e "*" só como primeira etiqueta (wildcard).
const ETIQUETA = "[a-z0-9_]([a-z0-9_-]{0,61}[a-z0-9_])?";
const NOME_REGEX = new RegExp(`^(@|(\\*|${ETIQUETA})(\\.${ETIQUETA})*)$`);

const nomeSchema = z
  .string({ error: "O nome é obrigatório." })
  .trim()
  .toLowerCase()
  .min(1, "O nome é obrigatório.")
  .max(200, "O nome não pode ter mais de 200 caracteres.")
  .regex(
    NOME_REGEX,
    'Nome inválido. Use apenas o prefixo (ex.: "app" ou "api.v2"), "@" para a raiz do domínio ou "*" para wildcard.'
  );

const tipoDnsSchema = z.enum(TIPOS_DNS, {
  error: `Tipo de registo DNS inválido. Valores aceites: ${TIPOS_DNS.join(", ")}.`,
});

// "" é tratado como "sem valor" (null), para que um formulário vazio conte como vazio
const destinoSchema = z.preprocess(
  (valor) => (typeof valor === "string" && valor.trim() === "" ? null : valor),
  z
    .string({ error: "O destino deve ser texto." })
    .trim()
    .max(4096, "O destino não pode ter mais de 4096 caracteres.")
    .nullable()
    .optional()
);

const servidorIdSchema = z
  .number({ error: "O servidor deve ser um número." })
  .int("O servidor é inválido.")
  .positive("O servidor é inválido.")
  .max(INT_MAX, "O servidor é inválido.")
  .nullable()
  .optional();

const dominioIdSchema = z
  .number({ error: "O domínio é obrigatório e deve ser um número." })
  .int("O domínio é inválido.")
  .positive("O domínio é inválido.")
  .max(INT_MAX, "O domínio é inválido.");

// A coerência entre tipoDns, servidorId e destino é verificada no service,
// porque num PATCH depende também do registo já existente.
const campos = {
  dominioId: dominioIdSchema,
  nome: nomeSchema,
  tipoDns: tipoDnsSchema,
  servidorId: servidorIdSchema,
  destino: destinoSchema,
};

const criarSubdominioSchema = z.object(campos);

const atualizarSubdominioSchema = z
  .object(campos)
  .partial()
  .refine((dados) => Object.keys(dados).length > 0, {
    error: "Indique pelo menos um campo para atualizar.",
  });

const subdominioIdParamsSchema = z.object({
  id: z.coerce.number({ error: "ID inválido." }).int("ID inválido.").positive("ID inválido."),
});

module.exports = {
  criarSubdominioSchema,
  atualizarSubdominioSchema,
  subdominioIdParamsSchema,
};