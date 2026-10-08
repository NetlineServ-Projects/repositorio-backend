const atividadeService = require("../services/atividadeService");
const HTTP = require("../utils/httpsStatus");
const response = require("../utils/response");

exports.obterAtividadesRecentes = async (req, res, next) => {
  try {
    const limite = req.query.limite ? Number(req.query.limite) : 20;
    const ehAdmin = req.user?.perfil === "ADMIN";
    const usuarioId = ehAdmin
      ? req.query.usuarioId
        ? Number(req.query.usuarioId)
        : undefined
      : req.user?.id;

    const atividades = await atividadeService.listarRecentes(limite, usuarioId);
    return response.success(res, null, atividades, HTTP.OK);
  } catch (error) {
    next(error);
  }
};