const { z } = require("zod");

const INT_MAX = 2147483647;
const VISIBILIDADES = ["PUBLICA", "PRIVADA"];
const ORIGENS = ["PROPRIA", "TERCEIROS"];

// Caminho completo da imagem, em minúsculas, ex: "moodlehq/moodle-php-apache"
const NOME_IMAGEM_REGEX = /^[a-z0-9]+([._-][a-z0-9]+)*(\/[a-z0-9]+([._-][a-z0-9]+)*)*$/;
const TAG_REGEX = /^[A-Za-z0-9_][A-Za-z0-9._-]{0,127}$/;
const DIGEST_REGEX = /^sha256:[a-f0-9]{64}$/;

// "" é tratado como "sem valor" (null)
const vazioParaNull = (valor) =>
  typeof valor === "string" && valor.trim() === "" ? null : valor;

const campos = {
  nome: z
    .string({ error: "O nome da imagem é obrigatório." })
    .trim()
    .min(2, "O nome da imagem deve ter pelo menos 2 caracteres.")
    .max(255, "O nome da imagem não pode ter mais de 255 caracteres.")
    .regex(NOME_IMAGEM_REGEX, "Nome inválido. Use minúsculas, números e . _ - / (ex: netline/repositorio-backend)."),
  tag: z
    .string({ error: "A tag deve ser texto." })
    .trim()
    .regex(TAG_REGEX, "Tag inválida."),
  portaExposta: z
    .number({ error: "A porta deve ser um número." })
    .int("A porta deve ser um número inteiro.")
    .min(1, "A porta deve ser entre 1 e 65535.")
    .max(65535, "A porta deve ser entre 1 e 65535.")
    .nullable(),
  digest: z.preprocess(
    vazioParaNull,
    z.string({ error: "O digest deve ser texto." }).trim().regex(DIGEST_REGEX, "Digest inválido (formato sha256:...).").nullable()
  ),
  ultimoPushEm: z.preprocess(
    vazioParaNull,
    z.coerce.date({ error: "Data do último push inválida." }).nullable()
  ),
  visibilidade: z.enum(VISIBILIDADES, { error: "Visibilidade inválida (PUBLICA ou PRIVADA)." }),
  origem: z.enum(ORIGENS, { error: "Origem inválida (PROPRIA ou TERCEIROS)." }),
  ativo: z.boolean({ error: "O estado deve ser verdadeiro ou falso." }),
  plataformaId: z
    .number({ error: "A plataforma é obrigatória." })
    .int("ID de plataforma inválido.")
    .positive("ID de plataforma inválido.")
    .max(INT_MAX, "ID de plataforma inválido."),
};

// Obrigatórios na criação: nome e plataforma. O resto usa os defaults do Prisma.
const criarImagemSchema = z.object({
  nome: campos.nome,
  plataformaId: campos.plataformaId,
  tag: campos.tag.optional(),
  portaExposta: campos.portaExposta.optional(),
  digest: campos.digest.optional(),
  ultimoPushEm: campos.ultimoPushEm.optional(),
  visibilidade: campos.visibilidade.optional(),
  origem: campos.origem.optional(),
  ativo: campos.ativo.optional(),
});

// A imagem não muda de plataforma depois de criada
const atualizarImagemSchema = z
  .object(campos)
  .omit({ plataformaId: true })
  .partial()
  .refine((dados) => Object.keys(dados).length > 0, {
    error: "Indique pelo menos um campo para atualizar.",
  });

const imagemIdParamsSchema = z.object({
  id: z.coerce.number({ error: "ID inválido." }).int("ID inválido.").positive("ID inválido."),
});

module.exports = {
  criarImagemSchema,
  atualizarImagemSchema,
  imagemIdParamsSchema,
};