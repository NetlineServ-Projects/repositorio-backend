const express = require("express");
const router = express.Router();

const funcionarioController = require("../controllers/funcionarioController");

// Criar funcionário
router.post("/", funcionarioController.criar);
router.get("/", funcionarioController.listar);

module.exports = router;