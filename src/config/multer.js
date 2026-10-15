const multer = require("multer");
const path = require("path");
const { gerarNomeArquivo } = require("../utils/fileHelper");

// ─── Upload genérico (documentos e avatares) ──────────────────────────────────

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, gerarNomeArquivo(file.originalname, ext));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const tiposPermitidos = /pdf|doc|docx|xls|xlsx|png|jpg|jpeg/;
    const extValida = tiposPermitidos.test(path.extname(file.originalname).toLowerCase());

    if (!extValida) {
      const erro = new Error("INVALID_DOCUMENT_TYPE");
      erro.code = "INVALID_DOCUMENT_TYPE";
      return cb(erro);
    }
    cb(null, true);
  },
});

// ─── Upload de logótipo de plataforma ────────────────────────────────────────
// Aceita só PNG, JPEG e WebP (SVG excluído por risco de XSS).
// Máximo: 2 MB. Destino: uploads/plataformas/.

const storageLogotipo = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/plataformas/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, gerarNomeArquivo(file.originalname, ext));
  },
});

const uploadLogotipo = multer({
  storage: storageLogotipo,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const tiposPermitidos = /png|jpg|jpeg|webp/;
    const extValida = tiposPermitidos.test(path.extname(file.originalname).toLowerCase());
    const mimeValido = tiposPermitidos.test(file.mimetype.split("/")[1]);

    if (!extValida || !mimeValido) {
      const erro = new Error("INVALID_LOGO_TYPE");
      erro.code = "INVALID_LOGO_TYPE";
      return cb(erro);
    }
    cb(null, true);
  },
});

module.exports = upload;
module.exports.uploadLogotipo = uploadLogotipo;