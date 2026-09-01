const prisma = require("../config/prisma");

async function registrar(tx, { usuarioId, acao, documentoId }) {
  return tx.atividade.create({
    data: { usuarioId, acao, documentoId },
  });
}

async function listarRecentes(limite = 5) {
  return prisma.atividade.findMany({
    orderBy: { criadoEm: "desc" },
    take: limite,
    include: {
      usuario: { select: { id: true, nome: true } },
      documento: { select: { id: true, titulo: true } },
    },
  });
}

module.exports = { registrar, listarRecentes };