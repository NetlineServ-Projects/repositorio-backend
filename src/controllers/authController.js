const authService = require("../services/authService");

// REGISTER
exports.register = async (req, res) => {
    try {
        const user = await authService.register(req.body);

        return res.status(201).json({
            mensagem: "Utilizador criado com sucesso",
            user
        });
    } catch (error) {
        return res.status(400).json({
            mensagem: error.message
        });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const result = await authService.login(req.body);

        return res.json({
            mensagem: "Login efetuado com sucesso",
            ...result
        });
    } catch (error) {
        return res.status(400).json({
            mensagem: error.message
        });
    }
};

// ME
exports.me = async (req, res) => {
    try {
        // req.user vem injetado do authMiddleware
        const user = await authService.getUserById(req.user.id);

        if (!user) {
            return res.status(404).json({ mensagem: "Utilizador não encontrado" });
        }

        return res.json(user);
    } catch (error) {
        return res.status(500).json({
            mensagem: error.message
        });
    }
};