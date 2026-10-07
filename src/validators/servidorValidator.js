const { z } = require("zod");

const INT_MAX = 2147483647; // limite da coluna INT do MySQL

const UNIDADES_ARMAZENAMENTO = ["MB", "GB", "TB"];
const UNIDADES_VELOCIDADE = ["MBPS", "GBPS"];

// Hostname (RFC 1123): etiquetas de 1 a 63 caracteres separadas por pontos
const HOSTNAME_REGEX =
  /^(?=.{1,253}$)[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const textoObrigatorio = (campo, min, max) =>
  z
    .string({ error: `${campo} é obrigatório.` })
    .trim()
    .min(min, `${campo} deve ter pelo menos ${min} caracteres.`)
    .max(max, `${campo} não pode ter mais de ${max} caracteres.`);

// Opcional: "" é tratado como "sem valor" (null)
const textoOpcional = (campo, max) =>
  z.preprocess(
    (valor) => (typeof valor === "string" && valor.trim() === "" ? null : valor),
    z
      .string({ error: `${campo} deve ser texto.` })
      .trim()
      .max(max, `${campo} não pode ter mais de ${max} caracteres.`)
      .nullable()
      .optional()
  );

const inteiroPositivo = (campo) =>
  z
    .number({ error: `${campo} deve ser um número.` })
    .int(`${campo} deve ser um número inteiro.`)
    .positive(`${campo} deve ser maior que zero.`)
    .max(INT_MAX, `${campo} é demasiado grande.`);

const ipSchema = z
  .string({ error: "O IP é obrigatório." })
  .trim()
  .pipe(z.union([z.ipv4(), z.ipv6()], { error: "IP inválido. Indique um IPv4 ou IPv6 válido." }));

// As unidades NÃO têm default aqui de propósito: o default (GB / MBPS) vem do Prisma.
// Se tivessem default no Zod, um PATCH sem unidade repunha a unidade para o valor padrão.
const campos = {
  nome: textoObrigatorio("O nome", 2, 255),
  hostname: z
    .string({ error: "O hostname é obrigatório." })
    .trim()
    .regex(HOSTNAME_REGEX, "Hostname inválido."),
  ip: ipSchema,
  usernameSsh: z
    .string({ error: "O utilizador SSH é obrigatório." })
    .trim()
    .min(1, "O utilizador SSH é obrigatório.")
    .max(255, "O utilizador SSH não pode ter mais de 255 caracteres.")
    .regex(/^\S+$/, "O utilizador SSH não pode conter espaços."),
  // Não leva trim: uma password pode começar ou acabar com espaços
  password: z
    .string({ error: "A password é obrigatória." })
    .min(1, "A password é obrigatória.")
    .max(255, "A password não pode ter mais de 255 caracteres."),
  numeroCpu: inteiroPositivo("O número de CPUs"),
  memoriaRam: inteiroPositivo("A memória RAM"),
  memoriaRamUnidade: z.enum(UNIDADES_ARMAZENAMENTO, { error: "Unidade de RAM inválida (MB, GB ou TB)." }).optional(),
  disco: inteiroPositivo("O tamanho do disco"),
  discoUnidade: z.enum(UNIDADES_ARMAZENAMENTO, { error: "Unidade de disco inválida (MB, GB ou TB)." }).optional(),
  larguraBanda: inteiroPositivo("A largura de banda"),
  larguraBandaUnidade: z.enum(UNIDADES_VELOCIDADE, { error: "Unidade de largura de banda inválida (MBPS ou GBPS)." }).optional(),
  sistemaOperativo: textoObrigatorio("O sistema operativo", 2, 100),
  versaoSo: textoOpcional("A versão do SO", 50),
  cloud: textoOpcional("A cloud", 255),
  regiao: textoOpcional("A região", 100),
  plataformaId: inteiroPositivo("A plataforma"),
};

const criarServidorSchema = z.object(campos);

const atualizarServidorSchema = z
  .object(campos)
  .partial()
  .refine((dados) => Object.keys(dados).length > 0, {
    error: "Indique pelo menos um campo para atualizar.",
  });

const servidorIdParamsSchema = z.object({
  id: z.coerce.number({ error: "ID inválido." }).int("ID inválido.").positive("ID inválido."),
});

module.exports = {
  criarServidorSchema,
  atualizarServidorSchema,
  servidorIdParamsSchema,
};