const express = require("express");
const router = express.Router();

const categoriaController = require("../controllers/categoriaController");
const authMiddleware = require("../middlewares/authMiddleware");

// Buscar categorias (qualquer utilizador autenticado)
router.get("/", authMiddleware, categoriaController.listarCategorias);

module.exports = router;