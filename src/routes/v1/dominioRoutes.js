const { Router } = require("express");
const router = Router();

const dominioController = require("../../controllers/dominioController");
const authMiddleware = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/roleMiddleware");
const validate = require("../../validators/validate");
const ROLES = require("../../constants/roles");

const {
  criarDominioSchema,
  atualizarDominioSchema,
  dominioIdParamsSchema,
} = require("../../validators/dominioValidator");

// Leitura: qualquer utilizador autenticado (ADMIN e FUNCIONARIO).
// Escrita: exclusivo ADMIN. Não há reautenticação: o domínio não guarda dados sensíveis.
const leitura = [authMiddleware];
const escrita = [authMiddleware, authorize(ROLES.ADMIN)];

router.get("/", ...leitura, dominioController.listar);

router.get(
  "/:id",
  ...leitura,
  validate(dominioIdParamsSchema, "params"),
  dominioController.obter
);

router.post(
  "/",
  ...escrita,
  validate(criarDominioSchema),
  dominioController.criar
);

router.patch(
  "/:id",
  ...escrita,
  validate(dominioIdParamsSchema, "params"),
  validate(atualizarDominioSchema),
  dominioController.atualizar
);

router.delete(
  "/:id",
  ...escrita,
  validate(dominioIdParamsSchema, "params"),
  dominioController.apagar
);

module.exports = router;