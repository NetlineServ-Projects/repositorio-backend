const response = require("../utils/response");
const HTTP_STATUS = require("../utils/httpsStatus");
const MESSAGES = require("../utils/messages");

function errorMiddleware(err, req, res, next) {
    console.error(err);

    // Erro conhecido, lançado intencionalmente por um service via AppError
    if (err.statusCode) {
        return response.error(res, err.message, err.statusCode);
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

// É o middleware de tratamento centralizado de erros do Express. 
// A ideia: em vez de cada controller/service ter que fazer try/catch
//  e formatar a resposta de erro manualmente toda vez,
//  qualquer erro não tratado (ex: throw new Error(...) num service, ou uma exceção do Prisma)
//  "cai" automaticamente aqui, num único lugar.
// Ele funciona porque o Express reconhece middlewares 
// com 4 parâmetros (err, req, res, next) como tratadores de erro,
//  e são sempre registados por último, depois de todas as rotas.