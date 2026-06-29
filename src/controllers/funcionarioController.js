const funcionarioService = require("../services/funcionarioService");

// =======================
// CRIAR FUNCIONÁRIO
// =======================
exports.criar = async (req, res) => {
    try {
        const funcionario = await funcionarioService.criarFuncionario(req.body);

        return res.status(201).json({
            mensagem: "Funcionário criado com sucesso",
            funcionario
        });

    } catch (error) {
        return res.status(400).json({
            mensagem: error.message
        });
    }
};

// LISTAR FUNCIONÁRIOS
exports.listar = async (req, res) => {
    try {
        const funcionarios = await funcionarioService.listarFuncionarios();

        return res.json({
            funcionarios
        });

    } catch (error) {
        return res.status(500).json({
            mensagem: "Erro ao listar funcionários",
            error: error.message
        });
    }
};