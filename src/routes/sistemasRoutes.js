const { Router } = require("express");
const router = Router();

const sistemaController = require("../controllers/sistemasController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");
const validate = require("../validators/validate");

const { createSistemaSchema } = require("../validators/sistemaValidator");
const ROLES = require("../constants/roles");

// Listar sistemas (qualquer utilizador autenticado)
router.get("/", authMiddleware, sistemaController.listar);

// Obter detalhes de um sistema (qualquer utilizador autenticado)
router.get("/:id", authMiddleware, sistemaController.obterPorId);

// Criar sistema — só ADMIN
router.post(
  "/",
  authMiddleware,
  authorize(ROLES.ADMIN),
  validate(createSistemaSchema),
  sistemaController.criar
);

// Atualizar sistema — só ADMIN
router.put(
  "/:id",
  authMiddleware,
  authorize(ROLES.ADMIN),
  sistemaController.atualizar
);

// Apagar sistema — só ADMIN
router.delete(
  "/:id",
  authMiddleware,
  authorize(ROLES.ADMIN),
  sistemaController.apagar
);

module.exports = router;