const express = require("express");
const router = express.Router();

const upload = require("../config/multer");
const documentoController = require("../controllers/documentoController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");
const validate = require("../validators/validate");

const { createDocumentoSchema } = require("../validators/documentoValidator");
const ROLES = require("../constants/roles");

// Criar documento (qualquer utilizador autenticado)
router.post(
  "/",
  authMiddleware,
  upload.single("ficheiro"),
  validate(createDocumentoSchema),
  documentoController.criarDocumento
);

// Listar documentos (qualquer utilizador autenticado)
router.get("/", authMiddleware, documentoController.listarDocumentos);

// Buscar documento por ID (qualquer utilizador autenticado)
router.get("/:id", authMiddleware, documentoController.buscarDocumentoPorId);

// Aprovar documento — só ADMIN
router.put(
  "/:id/aprovar",
  authMiddleware,
  authorize(ROLES.ADMIN),
  documentoController.aprovarDocumento
);

// Rejeitar documento — só ADMIN
router.put(
  "/:id/rejeitar",
  authMiddleware,
  authorize(ROLES.ADMIN),
  documentoController.rejeitarDocumento
);

// Atualizar documento (editar título, mudar estado, etc.)
router.put("/:id", authMiddleware, documentoController.atualizarDocumento);

// Apagar documento definitivamente da base de dados
router.delete("/:id", authMiddleware, documentoController.eliminarDocumento);

module.exports = router;