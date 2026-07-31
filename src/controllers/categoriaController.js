const categoriaService = require("../services/categoriaService");
const HTTP = require("../utils/httpsStatus");
const response = require("../utils/response");

exports.listarCategorias = async (req, res, next) => {
    try {
        const categorias = await categoriaService.listarCategorias();
        return response.success(res, null, categorias, HTTP.OK);
    } catch (error) {
        next(error);
    }
};

module.exports = { listarCategorias: exports.listarCategorias };