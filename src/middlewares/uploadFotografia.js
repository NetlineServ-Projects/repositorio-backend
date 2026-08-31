const multer = require("multer");
const path = require("path");
const { gerarNomeArquivo } = require("../utils/fileHelper");
const AppError = require("../utils/AppError");
const MSG = require("../utils/messages");
const HTTP_STATUS = require("../utils/httpsStatus");

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/avatars"),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, gerarNomeArquivo(file.originalname, ext));
    }
});

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];

const fileFilter = (req, file, cb) => {
    if (!TIPOS_PERMITIDOS.includes(file.mimetype)) {
        return cb(new AppError(MSG.VALIDATION.INVALID_FILE_TYPE, HTTP_STATUS.BAD_REQUEST));
    }
    cb(null, true);
};

const uploadFotografia = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter
});

module.exports = uploadFotografia;