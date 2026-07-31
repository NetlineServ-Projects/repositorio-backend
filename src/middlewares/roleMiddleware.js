const response = require("../utils/response");
const HTTP = require("../utils/httpsStatus");
const MSG = require("../utils/messages");

function authorize(...papeisPermitidos) {
    return (req, res, next) => {
        const { perfil } = req.user;

        if (!papeisPermitidos.includes(perfil)) {
            return response.error(res, MSG.AUTH.FORBIDDEN, HTTP.FORBIDDEN);
        }

        next();
    };
}

module.exports = authorize;