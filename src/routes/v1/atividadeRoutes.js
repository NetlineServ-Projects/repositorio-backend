const express = require("express");
const router = express.Router();

const atividadeController = require("../../controllers/atividadeController");
const authenticate = require("../../middlewares/authMiddleware");

router.get("/recentes", authenticate, atividadeController.obterAtividadesRecentes);

module.exports = router;