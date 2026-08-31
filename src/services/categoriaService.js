const prisma = require("../config/prisma");
const cache = require("../utils/cache");

exports.listarCategorias = async (perfil) => {

    const chaveCache = `categorias:${perfil}`;

    const cacheHit = cache.get(chaveCache);
    if (cacheHit) {
        return cacheHit;
    }

    const where = perfil === "ADMIN" ? {} : { sensivel: false };

    const categorias = await prisma.categoria.findMany({
        where,
        orderBy: {
            nome: "asc"
        }
    });

    cache.set(chaveCache, categorias);

    return categorias;

};