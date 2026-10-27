const express = require("express");
const router = express.Router();

const notificacaoController = require("../../controllers/notificacaoController");
const authenticate = require("../../middlewares/authMiddleware");

// Qualquer utilizador autenticado, sempre sobre as próprias notificações
router.get("/", authenticate, notificacaoController.listar);
router.get("/contagem", authenticate, notificacaoController.contarNaoLidas);
router.patch("/lidas", authenticate, notificacaoController.marcarTodasComoLidas);
router.patch("/:id/lida", authenticate, notificacaoController.marcarComoLida);

module.exports = router;
