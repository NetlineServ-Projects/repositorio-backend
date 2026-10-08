const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const { validarEnvVars } = require("./utils/fileHelper");

// Falha rápido se alguma variável de ambiente crítica estiver em falta.
// Melhor detectar no arranque do que quando a primeira chamada chegar.
validarEnvVars(["DATABASE_URL", "JWT_SECRET", "ENCRYPTION_KEY"]);

const languageMiddleware = require("./middlewares/i18n");

// Importa as rotas
const routesV1 = require("./routes/v1");

// Importa o middleware de erro
const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();

// Configurações Globais
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
    })
);
app.use(express.json());
app.use(languageMiddleware);

// Tornar a pasta de uploads pública estaticamente
app.use(
    "/uploads",
    express.static(path.join(__dirname, "..", "uploads"))
);

// Rota base
app.get("/", (req, res) => {
    res.status(200).json({
        mensagem: "API do Repositório Netline funcionando com sucesso!",
    });
});

// Rotas da API v1
app.use("/api/v1", routesV1);

// Middleware de tratamento de erros — SEMPRE por último
app.use(errorMiddleware);

// Configuração da porta e inicialização do servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor iniciado com sucesso na porta ${PORT}`);
});