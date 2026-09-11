const jwt = require("jsonwebtoken");
const HTTP = require("../utils/httpsStatus");
const MSG = require("../utils/messages");
const response = require("../utils/response");

/**
 * Exige um token elevado válido (emitido por POST /auth/reautenticar),
 * enviado no header "x-token-elevado" — nunca no Authorization normal,
 * para não se confundir com o JWT de sessão já validado pelo authMiddleware.
 *
 * Usar sempre DEPOIS de authMiddleware + authorize("ADMIN") na cadeia da rota.
 */
module.exports = function exigirReautenticacao(req, res, next) {
  const tokenElevado = req.headers["x-token-elevado"];

  if (!tokenElevado) {
    return response.error(res, MSG.AUTH.REAUTENTICACAO_NECESSARIA, HTTP.UNAUTHORIZED);
  }

  try {
    const payload = jwt.verify(tokenElevado, process.env.JWT_SECRET);

    if (payload.tipo !== "elevado") {
      return response.error(res, MSG.AUTH.TOKEN_INVALIDO, HTTP.UNAUTHORIZED);
    }

    // Confirma que o token elevado pertence ao mesmo utilizador da sessão normal
    if (payload.usuarioId !== req.user.id) {
      return response.error(res, MSG.AUTH.TOKEN_INVALIDO, HTTP.UNAUTHORIZED);
    }

    next();
  } catch (error) {
    // jwt.verify lança TokenExpiredError/JsonWebTokenError — tratamos ambos como reautenticação necessária
    return response.error(res, MSG.AUTH.REAUTENTICACAO_NECESSARIA, HTTP.UNAUTHORIZED);
  }
};