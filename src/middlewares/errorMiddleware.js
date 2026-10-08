const multer = require("multer");
const response = require("../utils/response");
const HTTP_STATUS = require("../utils/httpsStatus");
const MESSAGES = require("../utils/messages");

/**
 * Middleware global de erros.
 * Recebe erros lançados por services (AppError) ou por bibliotecas
 * externas (Multer, Prisma) e normaliza a resposta para o cliente.
 * NUNCA expõe stack traces em produção.
 */
function errorMiddleware(err, req, res, next) {
    // Regista sempre o erro internamente para diagnóstico
    console.error("[errorMiddleware]", err);

    // ── AppError: erro operacional deliberado lançado pelo service ────────────
    if (err.statusCode) {
        return response.error(res, err.message, err.statusCode);
    }

    // ── Multer: ficheiro demasiado grande ─────────────────────────────────────
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return response.error(
                res,
                MESSAGES.VALIDATION.FILE_TOO_LARGE,
                HTTP_STATUS.BAD_REQUEST
            );
        }
        return response.error(
            res,
            MESSAGES.VALIDATION.INVALID_DATA,
            HTTP_STATUS.BAD_REQUEST
        );
    }

    // ── Tipo de documento não permitido (fileFilter customizado) ──────────────
    if (err.code === "INVALID_DOCUMENT_TYPE") {
        return response.error(
            res,
            MESSAGES.VALIDATION.INVALID_DOCUMENT_TYPE,
            HTTP_STATUS.BAD_REQUEST
        );
    }

    // ── Prisma P2002: violação de constraint unique ───────────────────────────
    // Não mapeamos para uma mensagem específica de domínio (ex: "email já existe")
    // porque P2002 pode ocorrer em qualquer modelo. O service deve apanhar este
    // código antes e lançar um AppError com mensagem correcta (ver tratarNomeDuplicado).
    // Se chegar aqui é um P2002 não tratado → mensagem genérica.
    if (err.code === "P2002") {
        const campos = err.meta?.target ? ` (${err.meta.target.join(", ")})` : "";
        return response.error(
            res,
            `Já existe um registo com este(s) valor(es) único(s)${campos}.`,
            HTTP_STATUS.CONFLICT
        );
    }

    // ── Prisma P2025: registo não encontrado ao fazer update/delete ───────────
    // Como o service deve verificar a existência antes de qualquer operação
    // de escrita e lançar AppError, este caso só ocorre em situações inesperadas.
    if (err.code === "P2025") {
        return response.error(
            res,
            MESSAGES.SERVER.INTERNAL_ERROR,
            HTTP_STATUS.NOT_FOUND
        );
    }

    // ── Erro não mapeado ──────────────────────────────────────────────────────
    return response.error(
        res,
        MESSAGES.SERVER.INTERNAL_ERROR,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
}

module.exports = errorMiddleware;