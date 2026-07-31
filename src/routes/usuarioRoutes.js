const express = require("express");
const router = express.Router();

const usuarioController = require("../controllers/usuarioController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");
const validate = require("../validators/validate");

const { createUserSchema } = require("../validators/usuarioValidator");
const ROLES = require("../constants/roles");

// Apenas administradores podem criar utilizadores
router.post(
    "/",
    authMiddleware,
    authorize(ROLES.ADMIN),
    validate(createUserSchema),
    usuarioController.criarUsuario
);

module.exports = router;