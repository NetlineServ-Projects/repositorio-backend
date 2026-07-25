const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Controller para listar todas as categorias
const listarCategorias = async (req, res) => {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: {
        nome: "asc", // Ordena as categorias de A a Z
      },
    });

    return res.status(200).json(categorias);
  } catch (error) {
    console.error("Erro ao listar categorias:", error);
    return res.status(500).json({ 
      error: "Erro interno do servidor ao buscar as categorias." 
    });
  }
};

module.exports = {
  listarCategorias,
};