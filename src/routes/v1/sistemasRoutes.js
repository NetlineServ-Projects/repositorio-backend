const { Router } = require("express");
const router = Router();

const sistemaController = require("../../controllers/sistemasController");
const authMiddleware = require("../../middlewares/authMiddleware");
const validate = require("../../validators/validate");

const { createSistemaSchema } = require("../../validators/sistemaValidator");
const { updateSistemaSchema } = require("../../validators/sistemaValidator");

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

// Editar e eliminar: só quem criou o sistema ou um ADMIN (verificado no service)
router.delete(
  "/:id",
  authMiddleware,
  sistemaController.apagar
);

module.exports = router;