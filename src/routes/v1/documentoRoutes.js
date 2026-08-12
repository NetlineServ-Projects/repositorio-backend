const express = require("express");
const router = express.Router();

const upload = require("../../config/multer");
const documentoController = require("../../controllers/documentoController");
const authMiddleware = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/roleMiddleware");
const validate = require("../../validators/validate");

const { createDocumentoSchema } = require("../../validators/documentoValidator");
const ROLES = require("../../constants/roles"); 


router.post(
  "/",
  authMiddleware,
  upload.single("ficheiro"),
  validate(createDocumentoSchema),
  documentoController.criarDocumento
);

router.get("/", authMiddleware, documentoController.listarDocumentos);

router.get("/:id", authMiddleware, documentoController.buscarDocumentoPorId);

router.patch("/:id", authMiddleware, documentoController.atualizarDocumento);

router.delete("/:id", authMiddleware, authorize(ROLES.ADMIN), documentoController.eliminarDocumento);

module.exports = router;