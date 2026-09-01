const express = require("express");
const router = express.Router();

const atividadeRoutes = require("./atividadeRoutes");
const authRoutes = require("./authRoutes");
const categoriaRoutes = require("./categoriaRoutes");
const documentoRoutes = require("./documentoRoutes");
const sistemasRoutes = require("./sistemasRoutes");
const usuarioRoutes = require("./usuarioRoutes");

router.use("/atividades", atividadeRoutes);
router.use("/auth", authRoutes);
router.use("/categorias", categoriaRoutes);
router.use("/documentos", documentoRoutes);
router.use("/sistemas", sistemasRoutes);
router.use("/usuarios", usuarioRoutes);

module.exports = router;