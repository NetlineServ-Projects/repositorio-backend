const { Router } = require("express");
const router = Router();

const subdominioController = require("../../controllers/subdominioController");
const authMiddleware = require("../../middlewares/authMiddleware");
const validate = require("../../validators/validate");

const { subdominioIdParamsSchema } = require("../../validators/subdominioValidator");

// Só leitura, para qualquer utilizador autenticado. Os subdomínios são criados,
// editados e removidos pelo registo de infraestrutura do sistema
router.get("/", authMiddleware, subdominioController.listar);

router.get(
  "/:id",
  authMiddleware,
  validate(subdominioIdParamsSchema, "params"),
  subdominioController.obter
);

module.exports = router;