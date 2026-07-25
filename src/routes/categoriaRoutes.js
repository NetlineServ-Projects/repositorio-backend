const express = require("express");

const router = express.Router();

const categoriaController = require("../controllers/categoriaController");



// Buscar categorias
router.get("/", categoriaController.listarCategorias);


module.exports = router;