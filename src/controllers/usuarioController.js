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

exports.listarUsuarios = async (req, res, next) => {
    try {
        const usuarios = await usuarioService.listarUsuarios();
        return response.success(res, null, usuarios, HTTP.OK);
    } catch (error) {
        next(error);
    }
};

exports.buscarUsuarioPorId = async (req, res, next) => {
    try {
        const { id } = req.params;
        const usuario = await usuarioService.buscarUsuarioPorId(id);
        return response.success(res, null, usuario, HTTP.OK);
    } catch (error) {
        next(error);
    }
};

exports.atualizarUsuario = async (req, res, next) => {
    try {
        const { id } = req.params;
        const dadosAtualizacao = req.body;

        if (!dadosAtualizacao || Object.keys(dadosAtualizacao).length === 0) {
            return response.error(res, MSG.VALIDATION.INVALID_DATA, HTTP.BAD_REQUEST);
        }

        const usuarioAtualizado = await usuarioService.atualizarUsuario(id, dadosAtualizacao);
        return response.success(res, MSG.USER.UPDATED, usuarioAtualizado, HTTP.OK);
    } catch (error) {
        next(error);
    }
};

exports.eliminarUsuario = async (req, res, next) => {
    try {
        const { id } = req.params;
        await usuarioService.eliminarUsuario(id);
        return response.success(res, MSG.USER.DELETED, null, HTTP.OK);
    } catch (error) {
        next(error);
    }
};