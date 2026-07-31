const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Importa as rotas
const authRoutes = require("./routes/authRoutes");
const categoriaRoutes = require("./routes/categoriaRoutes");
const documentoRoutes = require("./routes/documentoRoutes");
const sistemasRoutes = require("./routes/sistemasRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");

// Importa o middleware de erro
const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();

// Configurações Globais
app.use(cors());
app.use(express.json());

// Tornar a pasta de uploads pública estaticamente
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Rota base de teste
app.get("/", (req, res) => {
  res.status(200).json({
    mensagem: "API do Repositório Netline funcionando com sucesso!"
  });
});

// Vincular as rotas ao Express com o prefixo /api
app.use("/api/auth", authRoutes);
app.use("/api/categorias", categoriaRoutes);
app.use("/api/documentos", documentoRoutes);
app.use("/api/sistemas", sistemasRoutes);
app.use("/api/usuarios", usuarioRoutes);

// Middleware de tratamento de erros — SEMPRE por último, depois de todas as rotas
app.use(errorMiddleware);

// Configuração da Porta e Inicialização do Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado com sucesso na porta ${PORT}`);
});