const { z } = require("zod");

const TIPOS_PLATAFORMA = ["CLOUD_BASE_DADOS", "CONTAINERIZACAO", "GESTAO_DOMINIO"];

const nomeSchema = z
  .string({ error: "O nome é obrigatório." })
  .trim()
  .min(2, "O nome deve ter pelo menos 2 caracteres.")
  .max(255, "O nome não pode ter mais de 255 caracteres.");

// Aceita só http/https (bloqueia esquemas como javascript:) e trata "" como "sem valor"
const urlPainelSchema = z.preprocess(
  (valor) => (typeof valor === "string" && valor.trim() === "" ? null : valor),
  z
    .url({ protocol: /^https?$/, error: "O URL do painel deve começar por http:// ou https://." })
    .max(255, "O URL do painel não pode ter mais de 255 caracteres.")
    .nullable()
    .optional()
);

const criarPlataformaSchema = z.object({
  nome: nomeSchema,
  tipo: z.enum(TIPOS_PLATAFORMA, {
    error: `Tipo de plataforma inválido. Valores aceites: ${TIPOS_PLATAFORMA.join(", ")}.`,
  }),
  urlPainel: urlPainelSchema,
  ativo: z.boolean({ error: "O campo ativo deve ser verdadeiro ou falso." }).optional(),
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