const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    // 1. Pega o token do header Authorization
    const authHeader = req.headers.authorization;

    // 2. Verifica se o token foi enviado
    if (!authHeader) {
        return res.status(401).json({
            mensagem: "Token não fornecido"
        });
    }

    // 3. Divide o header e verifica se segue o padrão "Bearer <token>"
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({
            mensagem: "Erro no formato do token. Use o formato: Bearer <token>"
        });
    }

    const token = parts[1];

    try {
        // 4. Verifica se o token é válido
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 5. Guarda os dados do utilizador dentro da requisição
        req.user = decoded;

        // 6. Continua para a próxima função
        next();

    } catch (error) {
        return res.status(401).json({
            mensagem: "Token inválido ou expirado"
        });
    }
};