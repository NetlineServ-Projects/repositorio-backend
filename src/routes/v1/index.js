const express = require("express");

const router = express.Router();

const atividadeRoutes = require("./atividadeRoutes");
const authRoutes = require("./authRoutes");
const categoriaRoutes = require("./categoriaRoutes");
const documentoRoutes = require("./documentoRoutes");
const plataformaRoutes = require("./plataformaRoutes");
const servidorRoutes = require("./servidorRoutes");
const sistemasRoutes = require("./sistemasRoutes");
const sistemaInfraestruturaRoutes = require("./sistemaInfraestruturaRoutes");
const usuarioRoutes = require("./usuarioRoutes");
const healthRoutes = require("./healthRoutes");
const dominioRoutes = require("./dominioRoutes");
const subdominioRoutes = require("./subdominioRoutes");

router.use("/atividades", atividadeRoutes);

router.use("/auth", authRoutes);

router.use("/categorias", categoriaRoutes);

router.use("/documentos", documentoRoutes);

router.use("/plataformas", plataformaRoutes);

router.use("/servidores", servidorRoutes);

router.use("/sistemas", sistemasRoutes);

router.use("/sistemas", sistemaInfraestruturaRoutes);

router.use("/usuarios", usuarioRoutes);

router.use("/health", healthRoutes);

router.use("/dominios", dominioRoutes);

router.use("/subdominios", subdominioRoutes);

module.exports = router;