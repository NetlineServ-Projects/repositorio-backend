const prisma = require("../config/prisma");

exports.listarCategorias = async () => {

    return await prisma.categoria.findMany({
        orderBy: {
            nome: "asc"
        }
    });

};