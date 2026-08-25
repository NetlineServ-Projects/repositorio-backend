const prisma = require("../config/prisma"); // ajusta ao teu caminho real do client

async function registrar({ usuario, acao, alvo }) {
  try {
    await prisma.atividade.create({
      data: { usuario, acao, alvo },
    });
  } catch (erro) {
    // uma falha ao registar atividade nunca deve derrubar a ação principal
    console.error("Falha ao registar atividade:", erro.message);
  }
}

async function listarRecentes(limite = 5) {
  return prisma.atividade.findMany({
    orderBy: { criadoEm: "desc" },
    take: limite,
  });
}

module.exports = { registrar, listarRecentes };