const authService = require("../services/authService");
const usuarioService = require("../services/usuarioService");
const HTTP = require("../utils/httpsStatus");
const MSG = require("../utils/messages");
const response = require("../utils/response");

// =======================================
// LOGIN
// =======================================

exports.login = async (req, res, next) => {
    try {
        const result = await authService.login(req.body);
        return response.success(res, MSG.AUTH.LOGIN_SUCCESS, result, HTTP.OK);
    } catch (error) {
        next(error);
    }
};

// =======================================
// UTILIZADOR AUTENTICADO
// =======================================

exports.me = async (req, res, next) => {
    try {
        const user = await authService.getUserById(req.user.id);

        if (!user) {
            return response.error(res, MSG.AUTH.USER_NOT_FOUND, HTTP.NOT_FOUND);
        }

        return response.success(res, null, user, HTTP.OK);
    } catch (error) {
        next(error);
    }
};

// =======================================
// ALTERAR SENHA (opcional, feito pelo próprio utilizador)
// =======================================

exports.alterarSenha = async (req, res, next) => {
    try {
        const resultado = await authService.alterarSenha(req.user.id, req.body);
        return response.success(res, resultado.mensagem, null, HTTP.OK);
    } catch (error) {
        next(error);
    }
};

// =======================================
// ATUALIZAR PERFIL (exclusivo ADMIN)
// =======================================

exports.atualizarPerfil = async (req, res, next) => {
    try {
        const usuarioAtualizado = await usuarioService.atualizarUsuario(req.user.id, req.body);
        return response.success(res, MSG.USER.UPDATED, usuarioAtualizado, HTTP.OK);
    } catch (error) {
        next(error);
    }
};

// =======================================
// REAUTENTICAR (confirma password para aceder a dados sensíveis
// de infraestrutura — emite um token elevado, válido por 15 min)
// =======================================

exports.reautenticar = async (req, res, next) => {
    try {
        const resultado = await authService.reautenticar(req.user.id, req.body);
        return response.success(res, MSG.AUTH.REAUTENTICACAO_SUCESSO, resultado, HTTP.OK);
    } catch (error) {
        next(error);
    }
};