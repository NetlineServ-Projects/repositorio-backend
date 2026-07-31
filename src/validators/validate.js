const response = require("../utils/response");
const HTTP_STATUS = require("../utils/httpsStatus");
const MESSAGES = require("../utils/messages");

const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        const erros = result.error.issues.map(issue => ({
            campo: issue.path.join("."),
            mensagem: issue.message
        }));

        return response.error(res, MESSAGES.VALIDATION.INVALID_DATA, HTTP_STATUS.UNPROCESSABLE_ENTITY, erros);
    }

    req.body = result.data;
    next();
};

module.exports = validate;