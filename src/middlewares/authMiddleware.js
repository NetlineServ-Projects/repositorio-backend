const jwt = require("jsonwebtoken");

const HTTP = require("../utils/httpsStatus");
const MSG = require("../utils/messages");

function authenticate(req, res, next) {
    // 1. Obtém o header Authorization
    const authHeader = req.headers.authorization;

    // 2. Verifica se o token foi enviado
    if (!authHeader) {
        return res.status(HTTP.UNAUTHORIZED).json({
            mensagem: MSG.AUTH.TOKEN_NOT_PROVIDED
        });
    }

    // 3. Verifica se o formato é "Bearer <token>"
    const [tipo, token] = authHeader.split(" ");

    if (tipo !== "Bearer" || !token) {
        return res.status(HTTP.UNAUTHORIZED).json({
            mensagem: MSG.AUTH.INVALID_TOKEN_FORMAT
        });
    }

    try {
        // 4. Verifica e descodifica o token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 5. Guarda os dados do utilizador
        req.user = decoded;

        // 6. Continua para o próximo middleware/controller
        next();

    } catch (error) {
        console.error("Erro JWT:", error.message);
        return res.status(HTTP.UNAUTHORIZED).json({
            mensagem: MSG.AUTH.INVALID_OR_EXPIRED_TOKEN
        });
    }
}

module.exports = authenticate;