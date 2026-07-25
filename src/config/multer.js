const multer = require("multer");
const path = require("path");

// Configuração do armazenamento em disco
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Pasta onde os ficheiros serão guardados no servidor
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Gera um nome único para evitar sobrepor ficheiros com o mesmo nome
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

module.exports = upload;