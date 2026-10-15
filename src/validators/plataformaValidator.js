const { z } = require("zod");
const { TODOS_OS_FORNECEDORES } = require("../constants/fornecedoresPlataforma");

const TIPOS_PLATAFORMA = ["CLOUD_BASE_DADOS", "CONTAINERIZACAO", "GESTAO_DOMINIO"];

const vazioParaNull = (valor) =>
  typeof valor === "string" && valor.trim() === "" ? null : valor;

// O nome só é pedido quando o fornecedor é "Outro"; nos restantes vem do fornecedor.
// A regra (obrigatório só com "Outro") é verificada no service.
const nomeSchema = z.preprocess(
  (valor) => (typeof valor === "string" && valor.trim() === "" ? undefined : valor),
  z
    .string({ error: "O nome deve ser texto." })
    .trim()
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .max(255, "O nome não pode ter mais de 255 caracteres.")
    .optional()
);

const fornecedorSchema = z.enum(TODOS_OS_FORNECEDORES, { error: "Fornecedor inválido." });

// Aceita só http/https (bloqueia esquemas como javascript:) e trata "" como "sem valor"
const urlPainelSchema = z.preprocess(
  vazioParaNull,
  z
    .url({ protocol: /^https?$/, error: "O URL do painel deve começar por http:// ou https://." })
    .max(255, "O URL do painel não pode ter mais de 255 caracteres.")
    .nullable()
    .optional()
);

// Endereço de registry sem protocolo: host[:porta][/caminho], ex: "ghcr.io/netline"
const REGISTRY_URL_REGEX = /^[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?(:\d{1,5})?(\/[a-zA-Z0-9._-]+)*$/;

const registryUrlSchema = z.preprocess(
  vazioParaNull,
  z
    .string({ error: "O URL do registry deve ser texto." })
    .trim()
    .max(500, "O URL do registry não pode ter mais de 500 caracteres.")
    .regex(REGISTRY_URL_REGEX, "URL do registry inválido (ex: ghcr.io/netline).")
    .nullable()
    .optional()
);

const textoOpcionalSchema = (campo) =>
  z.preprocess(
    vazioParaNull,
    z
      .string({ error: `${campo} deve ser texto.` })
      .trim()
      .max(255, `${campo} não pode ter mais de 255 caracteres.`)
      .nullable()
      .optional()
  );

// Sem trim (um token não deve ser alterado). "" é ignorado: no PATCH, deixar o campo
// vazio significa "manter o token atual". Para apagar o token, enviar null.
const tokenSchema = z.preprocess(
  (valor) => (valor === "" ? undefined : valor),
  z
    .string({ error: "O token deve ser texto." })
    .max(1000, "O token não pode ter mais de 1000 caracteres.")
    .nullable()
    .optional()
);

const criarPlataformaSchema = z.object({
  nome: nomeSchema,
  tipo: z.enum(TIPOS_PLATAFORMA, {
    error: `Tipo de plataforma inválido. Valores aceites: ${TIPOS_PLATAFORMA.join(", ")}.`,
  }),
  fornecedor: fornecedorSchema,
  urlPainel: urlPainelSchema,
  ativo: z.boolean({ error: "O campo ativo deve ser verdadeiro ou falso." }).optional(),
  utilizador: textoOpcionalSchema("O utilizador"),
  token: tokenSchema,
  // Só para CONTAINERIZACAO (verificado no service)
  registryUrl: registryUrlSchema,
  namespace: textoOpcionalSchema("O namespace"),
});

const atualizarPlataformaSchema = criarPlataformaSchema
  .partial()
  .refine((dados) => Object.keys(dados).length > 0, {
    error: "Indique pelo menos um campo para atualizar.",
  });

const plataformaIdParamsSchema = z.object({
  id: z.coerce.number({ error: "ID inválido." }).int("ID inválido.").positive("ID inválido."),
});

module.exports = {
  criarPlataformaSchema,
  atualizarPlataformaSchema,
  plataformaIdParamsSchema,
};