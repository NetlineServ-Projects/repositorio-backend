const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

// =======================
// ROTAS DE AUTENTICAÇÃO
// =======================

// Rota de cadastro (pública)
router.post("/register", authController.register);

// Rota de login (pública)
router.post("/login", authController.login);

// Rota do perfil (protegida por Token JWT)
router.get("/me", authMiddleware, authController.me);

// Rota para eliminar a conta (protegida por Token JWT)
router.delete("/delete-current", authMiddleware, authController.deleteCurrent);

module.exports = router;