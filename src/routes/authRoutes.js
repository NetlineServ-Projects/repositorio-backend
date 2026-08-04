const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const validate = require("../validators/validate");

const { loginSchema, alterarSenhaSchema } = require("../validators/authValidator");

// Login (rota pública)
router.post("/login", validate(loginSchema), authController.login);

// Dados do utilizador autenticado
router.get("/me", authMiddleware, authController.me);

// Alterar senha (opcional, feito pelo próprio utilizador autenticado)
router.patch("/senha", authMiddleware, validate(alterarSenhaSchema), authController.alterarSenha);


module.exports = router;
