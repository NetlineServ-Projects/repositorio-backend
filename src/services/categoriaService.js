const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.listarCategorias = async () => {

    return await prisma.categoria.findMany({
        orderBy: {
            nome: "asc"
        }
    });

};