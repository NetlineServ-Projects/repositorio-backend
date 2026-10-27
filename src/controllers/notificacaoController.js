const notificacaoService = require("../services/notificacaoService");
const HTTP = require("../utils/httpsStatus");
const response = require("../utils/response");

// Cada utilizador só vê e marca as próprias notificações (req.user vem do token)

exports.listar = async (req, res, next) => {
  try {
    const resultado = await notificacaoService.listar(req.user);
    return response.success(res, null, resultado, HTTP.OK);
  } catch (error) {
    next(error);
  }
};

exports.contarNaoLidas = async (req, res, next) => {
  try {
    const resultado = await notificacaoService.contarNaoLidas(req.user);
    return response.success(res, null, resultado, HTTP.OK);
  } catch (error) {
    next(error);
  }
};

exports.marcarComoLida = async (req, res, next) => {
  try {
    await notificacaoService.marcarComoLida(req.params.id, req.user);
    return response.success(res, null, null, HTTP.OK);
  } catch (error) {
    next(error);
  }
};

exports.marcarTodasComoLidas = async (req, res, next) => {
  try {
    await notificacaoService.marcarTodasComoLidas(req.user);
    return response.success(res, null, null, HTTP.OK);
  } catch (error) {
    next(error);
  }
};
