const jwt = require("jsonwebtoken");

const HTTP = require("../utils/httpsStatus");
const MSG = require("../utils/messages");
const { NOME_COOKIE_SESSAO } = require("../utils/cookieSessao");

// O token vem do cookie HttpOnly da sessão (o frontend nunca o vê). O cabeçalho
// "Authorization: Bearer <token>" continua aceite para ferramentas como o Postman.
function obterToken(req) {
    const doCookie = req.cookies?.[NOME_COOKIE_SESSAO];
    if (doCookie) return { token: doCookie };

    const authHeader = req.headers.authorization;
    if (!authHeader) return { erro: MSG.AUTH.TOKEN_NOT_PROVIDED };

    const [tipo, token] = authHeader.split(" ");
    if (tipo !== "Bearer" || !token) return { erro: MSG.AUTH.INVALID_TOKEN_FORMAT };
    return { token };
}

function authenticate(req, res, next) {
    // 1-3. Obtém o token (cookie da sessão ou cabeçalho Bearer)
    const { token, erro } = obterToken(req);
    if (erro) {
        return res.status(HTTP.UNAUTHORIZED).json({ mensagem: erro });
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