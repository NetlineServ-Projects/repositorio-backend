const jwt = require("jsonwebtoken");

const response = require("../utils/response");
const HTTP = require("../utils/httpsStatus");
const MSG = require("../utils/messages");

function exigirReautenticacao(req, res, next) {
    const tokenElevado = req.headers["x-token-elevado"];

    if (!tokenElevado) {
        return response.error(res, MSG.AUTH.REAUTENTICACAO_NECESSARIA, HTTP.UNAUTHORIZED);
    }

    try {
        const payload = jwt.verify(tokenElevado, process.env.JWT_SECRET);

        if (payload.tipo !== "elevado" || payload.usuarioId !== req.user.id) {
            return response.error(res, MSG.AUTH.TOKEN_INVALIDO, HTTP.UNAUTHORIZED);
        }

        next();
    } catch (error) {
        // jwt.verify lança erro tanto para token expirado como inválido/adulterado —
        // reutilizamos a mesma mensagem de "token inválido", já que não há uma chave separada para "expirado"
        return response.error(res, MSG.AUTH.TOKEN_INVALIDO, HTTP.UNAUTHORIZED);
    }
}

module.exports = exigirReautenticacao;