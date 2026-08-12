const { Router } = require("express");
const router = Router();

const sistemaController = require("../../controllers/sistemasController");
const authMiddleware = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/roleMiddleware");
const validate = require("../../validators/validate");

const { createSistemaSchema } = require("../../validators/sistemaValidator");
const { updateSistemaSchema } = require("../../validators/sistemaValidator");
const ROLES = require("../../constants/roles");

// Listar sistemas (qualquer utilizador autenticado)
router.get("/", authMiddleware, sistemaController.listar);

// Obter detalhes de um sistema (qualquer utilizador autenticado)
router.get("/:id", authMiddleware, sistemaController.obterPorId);


router.post(
  "/",
  authMiddleware,
  validate(createSistemaSchema),
  sistemaController.criar
);


router.patch(
  "/:id",
  authMiddleware,
  validate(updateSistemaSchema),
  sistemaController.atualizar
);


router.delete(
  "/:id",
  authMiddleware,
  authorize(ROLES.ADMIN),
  sistemaController.apagar
);

module.exports = router;