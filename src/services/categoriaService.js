const prisma = require("../config/prisma");

exports.listarCategorias = async (perfil) => {

    const where = perfil === "ADMIN" ? {} : { sensivel: false };

    return await prisma.categoria.findMany({
        where,
        orderBy: {
            nome: "asc"
        }
    });

};