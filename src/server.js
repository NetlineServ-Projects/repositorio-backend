const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Importa as rotas de autenticação
const authRoutes = require("./routes/authRoutes");
const funcionarioRoutes = require("./routes/funcionarioRoutes");

const app = express();

// Configurações Globais
app.use(cors());
app.use(express.json());

// Rota base de teste
app.get("/", (req, res) => {
    res.status(200).json({
        mensagem: "API funcionando com sucesso!"
    });
});

// Vincular as rotas ao Express com prefixo
app.use("/api/auth", authRoutes);
app.use("/api/funcionario", funcionarioRoutes);

// Configuração da Porta e Inicialização do Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(` Servidor iniciado com sucesso na porta ${PORT}`);
});