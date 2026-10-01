const express = require("express");

const healthController = require("../../controllers/healthController");

const router = express.Router();

router.get("/", healthController.verificarSaude);

module.exports = router;