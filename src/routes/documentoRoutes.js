const express = require("express");
const router = express.Router();

const upload = require("../config/multer");
const documentoController = require("../controllers/documentoController");
const authMiddleware = require("../middlewares/authMiddleware");

// Criar documento
router.post(
  "/",
  authMiddleware,
  upload.single("ficheiro"),
  documentoController.criarDocumento
);

// Listar documentos
router.get("/", documentoController.listarDocumentos);

// Buscar documento por ID
router.get("/:id", documentoController.buscarDocumentoPorId);

// Aprovar documento
router.put("/:id/aprovar", documentoController.aprovarDocumento);

// Rejeitar documento
router.put("/:id/rejeitar", documentoController.rejeitarDocumento);



// Atualizar documento (editar título ou mudar status para "Lixeira", "Aprovado", etc.)
router.put("/:id", authMiddleware, documentoController.atualizarDocumento);

// Apagar documento definitivamente da base de dados
router.delete("/:id", authMiddleware, documentoController.eliminarDocumento);

module.exports = router;