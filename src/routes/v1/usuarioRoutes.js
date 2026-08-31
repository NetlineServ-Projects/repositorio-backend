const express = require("express");
const router = express.Router();

const usuarioController = require("../../controllers/usuarioController");
const authMiddleware = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/roleMiddleware");
const validate = require("../../validators/validate");
const uploadFotografia = require("../../middlewares/uploadFotografia"); // novo

const { createUserSchema, updateUserSchema } = require("../../validators/usuarioValidator");
const ROLES = require("../../constants/roles");

// Apenas administradores podem criar utilizadores
router.post(
    "/",
    authMiddleware,
    authorize(ROLES.ADMIN),
    validate(createUserSchema),
    usuarioController.criarUsuario
);

// Qualquer utilizador autenticado pode atualizar as PRÓPRIAS preferências
router.patch("/me/preferencias", authMiddleware, usuarioController.atualizarPreferencias);

// Qualquer utilizador autenticado pode atualizar a PRÓPRIA fotografia
router.patch(
    "/me/fotografia",
    authMiddleware,
    uploadFotografia.single("fotografia"),
    usuarioController.atualizarFotografia
);

router.get("/", authMiddleware, authorize(ROLES.ADMIN), usuarioController.listarUsuarios);

router.get("/:id", authMiddleware, authorize(ROLES.ADMIN), usuarioController.buscarUsuarioPorId);

router.patch("/:id", authMiddleware, authorize(ROLES.ADMIN), validate(updateUserSchema), usuarioController.atualizarUsuario);

router.delete("/:id", authMiddleware, authorize(ROLES.ADMIN), usuarioController.eliminarUsuario);

module.exports = router;