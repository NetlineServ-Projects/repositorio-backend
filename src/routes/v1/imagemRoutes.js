const { Router } = require("express");
const router = Router();

const imagemController = require("../../controllers/imagemController");
const authMiddleware = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/roleMiddleware");
const validate = require("../../validators/validate");
const ROLES = require("../../constants/roles");

const {
  criarImagemSchema,
  atualizarImagemSchema,
  imagemIdParamsSchema,
} = require("../../validators/imagemValidator");

// Leitura: qualquer utilizador autenticado.
const leitura = [authMiddleware];

// Escrita: exclusivo ADMIN.
const escrita = [authMiddleware, authorize(ROLES.ADMIN)];

router.get("/", ...leitura, imagemController.listar);

router.get(
  "/:id",
  ...leitura,
  validate(imagemIdParamsSchema, "params"),
  imagemController.obter
);

router.post(
  "/",
  ...escrita,
  validate(criarImagemSchema),
  imagemController.criar
);

router.patch(
  "/:id",
  ...escrita,
  validate(imagemIdParamsSchema, "params"),
  validate(atualizarImagemSchema),
  imagemController.atualizar
);

router.delete(
  "/:id",
  ...escrita,
  validate(imagemIdParamsSchema, "params"),
  imagemController.apagar
);

module.exports = router;