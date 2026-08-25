const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const categoriaRoutes = require("./categoriaRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const documentoRoutes = require("./documentoRoutes");
const sistemasRoutes = require("./sistemasRoutes");
const usuarioRoutes = require("./usuarioRoutes");

router.use("/auth", authRoutes);
router.use("/categorias", categoriaRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/documentos", documentoRoutes);
router.use("/sistemas", sistemasRoutes);
router.use("/usuarios", usuarioRoutes);

module.exports = router;