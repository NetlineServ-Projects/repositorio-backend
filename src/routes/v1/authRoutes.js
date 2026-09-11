const express = require("express");
const router = express.Router();

const authController = require("../../controllers/authController");
const authMiddleware = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/roleMiddleware");
const validate = require("../../validators/validate");

const {
    loginSchema,
    alterarSenhaSchema,
    atualizarPerfilSchema,
    reautenticarSchema,
} = require("../../validators/authValidator");

// Login (rota pública)
router.post("/login", validate(loginSchema), authController.login);

// Dados do utilizador autenticado
router.get("/me", authMiddleware, authController.me);

// Alterar senha (qualquer utilizador autenticado, incluindo funcionario)
router.patch("/senha", authMiddleware, validate(alterarSenhaSchema), authController.alterarSenha);

// Atualizar o próprio perfil (nome, email, cargo, departamento) — exclusivo ADMIN
router.patch("/me", authMiddleware, authorize("ADMIN"), validate(atualizarPerfilSchema), authController.atualizarPerfil);

// Reautenticar (confirma password novamente) — usado antes de aceder a
// dados sensíveis de infraestrutura; emite o token elevado de 15 min
router.post("/reautenticar", authMiddleware, validate(reautenticarSchema), authController.reautenticar);

module.exports = router;