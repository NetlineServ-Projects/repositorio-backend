const usuarioService = require("../services/usuarioService");
const HTTP = require("../utils/httpsStatus");
const MSG = require("../utils/messages");
const response = require("../utils/response");

exports.criarUsuario = async (req, res, next) => {
    try {
        const usuario = await usuarioService.criarUsuario(req.body);
        return response.success(res, MSG.USER.CREATED, usuario, HTTP.CREATED);
    } catch (error) {
        next(error);
    }
};