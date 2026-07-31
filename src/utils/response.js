const HTTP_STATUS = require("./httpsStatus");

const sendResponse = (res, statusCode, sucesso, mensagem, data = null) => {
    return res.status(statusCode).json({
        sucesso,
        mensagem,
        data
    });
};

const success = (res, mensagem, data = null, statusCode = HTTP_STATUS.OK) => {
    return sendResponse(res, statusCode, true, mensagem, data);
};

const error = (res, mensagem, statusCode = HTTP_STATUS.BAD_REQUEST, data = null) => {
    return sendResponse(res, statusCode, false, mensagem, data);
};

module.exports = {
    success,
    error
};