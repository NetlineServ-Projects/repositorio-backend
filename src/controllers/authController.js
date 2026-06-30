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

// DELETE CURRENT (Adicionado aqui)
exports.deleteCurrent = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ mensagem: "Utilizador não autenticado" });
        }

        // Delega a exclusão para o Service
        await authService.deleteUserById(userId);

        return res.status(200).json({
            mensagem: "Os seus dados foram permanentemente eliminados do sistema."
        });
    } catch (error) {
        // Se o service lançar um erro dizendo que não encontrou o utilizador
        if (error.message === "Utilizador não encontrado") {
            return res.status(404).json({ mensagem: error.message });
        }

        return res.status(500).json({
            mensagem: "Erro interno ao tentar remover a conta"
        });
    }
};