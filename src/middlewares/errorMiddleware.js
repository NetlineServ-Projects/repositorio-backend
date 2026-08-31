const multer = require("multer");
const response = require("../utils/response");
const HTTP_STATUS = require("../utils/httpsStatus");
const MESSAGES = require("../utils/messages");

function errorMiddleware(err, req, res, next) {
    console.error(err);

    // Erro conhecido, lançado intencionalmente por um service via AppError
    if (err.statusCode) {
        return response.error(res, err.message, err.statusCode);
    }

    // Erro do Multer — ficheiro excede o tamanho máximo, campo inesperado, etc.
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return response.error(res, MESSAGES.VALIDATION.FILE_TOO_LARGE, HTTP_STATUS.BAD_REQUEST);
        }
        return response.error(res, MESSAGES.VALIDATION.INVALID_DATA, HTTP_STATUS.BAD_REQUEST);
    }

    // Erro customizado do fileFilter (tipo de documento não permitido)
    if (err.code === "INVALID_DOCUMENT_TYPE") {
        return response.error(res, MESSAGES.VALIDATION.INVALID_DOCUMENT_TYPE, HTTP_STATUS.BAD_REQUEST);
    }

    // Erro do Prisma — registo duplicado (ex: email já existe, nome de categoria já existe)
    if (err.code === "P2002") {
        return response.error(res, MESSAGES.USER.EMAIL_ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
    }

    // Erro do Prisma — registo não encontrado ao tentar update/delete
    if (err.code === "P2025") {
        return response.error(res, MESSAGES.DOCUMENTO.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Erro não mapeado — nunca expõe o stack trace real ao cliente
    return response.error(res, MESSAGES.SERVER.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
}

module.exports = errorMiddleware;