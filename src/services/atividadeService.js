const prisma = require("../config/prisma");

async function registrar(tx, { usuarioId, acao, documentoId, sistemaId }) {
  return tx.atividade.create({
    data: { usuarioId, acao, documentoId, sistemaId },
  });
}

async function listarRecentes(limite = 5) {
  return prisma.atividade.findMany({
    orderBy: { criadoEm: "desc" },
    take: limite,
    include: {
      usuario: { select: { id: true, nome: true } },
      documento: { select: { id: true, titulo: true } },
      sistema: { select: { id: true, nome: true } }, // NOVO
    },
  });
}

module.exports = { registrar, listarRecentes };