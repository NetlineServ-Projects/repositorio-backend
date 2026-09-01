const atividadeService = require("../services/atividadeService");
const HTTP = require("../utils/httpsStatus");
const response = require("../utils/response");

exports.obterAtividadesRecentes = async (req, res, next) => {
  try {
    const limite = req.query.limite ? Number(req.query.limite) : 5;
    const atividades = await atividadeService.listarRecentes(limite);
    return response.success(res, null, atividades, HTTP.OK);
  } catch (error) {
    next(error);
  }
};