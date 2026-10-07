const { Router } = require("express");
const router = Router();

const servidorController = require("../../controllers/servidorController");
const authMiddleware = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/roleMiddleware");
const exigirReautenticacao = require("../../middlewares/exigirReautenticacao");
const validate = require("../../validators/validate");
const ROLES = require("../../constants/roles");

const {
  criarServidorSchema,
  atualizarServidorSchema,
  servidorIdParamsSchema,
} = require("../../validators/servidorValidator");

// Leitura (IP incluído, password nunca): qualquer utilizador autenticado.
const leitura = [authMiddleware];

// Escrita: exclusivo ADMIN. Para exigir também reautenticação (como na
// infraestrutura), acrescenta exigirReautenticacao a este array.
const escrita = [authMiddleware, authorize(ROLES.ADMIN)];

// Revelar a password: ADMIN e FUNCIONARIO, mas só com reautenticação recente
// (token elevado, 3 min). Para restringir ao ADMIN, acrescenta authorize(ROLES.ADMIN)
// entre os dois middlewares.
const leituraProtegida = [authMiddleware, exigirReautenticacao];

router.get("/", ...leitura, servidorController.listar);

router.get(
  "/:id",
  ...leitura,
  validate(servidorIdParamsSchema, "params"),
  servidorController.obter
);

router.get(
  "/:id/password",
  ...leituraProtegida,
  validate(servidorIdParamsSchema, "params"),
  servidorController.revelarPassword
);

router.post(
  "/",
  ...escrita,
  validate(criarServidorSchema),
  servidorController.criar
);

router.patch(
  "/:id",
  ...escrita,
  validate(servidorIdParamsSchema, "params"),
  validate(atualizarServidorSchema),
  servidorController.atualizar
);

router.delete(
  "/:id",
  ...escrita,
  validate(servidorIdParamsSchema, "params"),
  servidorController.apagar
);

module.exports = router;