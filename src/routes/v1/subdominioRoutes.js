const { Router } = require("express");
const router = Router();

const subdominioController = require("../../controllers/subdominioController");
const authMiddleware = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/roleMiddleware");
const validate = require("../../validators/validate");
const ROLES = require("../../constants/roles");

const {
  criarSubdominioSchema,
  atualizarSubdominioSchema,
  subdominioIdParamsSchema,
} = require("../../validators/subdominioValidator");

// Leitura: qualquer utilizador autenticado (ADMIN e FUNCIONARIO).
// Escrita: exclusivo ADMIN. Não há reautenticação: os registos DNS são públicos por natureza.
const leitura = [authMiddleware];
const escrita = [authMiddleware, authorize(ROLES.ADMIN)];

router.get("/", ...leitura, subdominioController.listar);

router.get(
  "/:id",
  ...leitura,
  validate(subdominioIdParamsSchema, "params"),
  subdominioController.obter
);

router.post(
  "/",
  ...escrita,
  validate(criarSubdominioSchema),
  subdominioController.criar
);

router.patch(
  "/:id",
  ...escrita,
  validate(subdominioIdParamsSchema, "params"),
  validate(atualizarSubdominioSchema),
  subdominioController.atualizar
);

router.delete(
  "/:id",
  ...escrita,
  validate(subdominioIdParamsSchema, "params"),
  subdominioController.apagar
);

module.exports = router;