const multer = require("multer");
const path = require("path");
const { gerarNomeArquivo } = require("../utils/fileHelper");

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

module.exports = upload;