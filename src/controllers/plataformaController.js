const service = require("../services/plataformaService");
const response = require("../utils/response");
const HTTP = require("../utils/httpsStatus");
const MSG = require("../utils/messages");

// O id chega aqui já validado e convertido para número
// (ver validate(..., "params") em plataformaRoutes.js).

exports.listar = async (req, res, next) => {
    try {
        const plataformas = await service.listarPlataformas();

        return response.success(res, MSG.PLATAFORMA.LISTADAS, plataformas, HTTP.OK);
    } catch (error) {
        next(error);
    }
};

exports.obterArvore = async (req, res, next) => {
    try {
        const arvore = await service.obterArvorePlataformas();

        return response.success(res, MSG.PLATAFORMA.ARVORE_OBTIDA, arvore, HTTP.OK);
    } catch (error) {
        next(error);
    }
};

exports.obterArvorePlataforma = async (req, res, next) => {
    try {
        const arvore = await service.obterArvorePlataforma(req.params.id);

        return response.success(res, MSG.PLATAFORMA.ARVORE_OBTIDA, arvore, HTTP.OK);
    } catch (error) {
        next(error);
    }
};

exports.obter = async (req, res, next) => {
    try {
        const plataforma = await service.obterPlataforma(req.params.id);

        return response.success(res, MSG.PLATAFORMA.OBTIDA, plataforma, HTTP.OK);
    } catch (error) {
        next(error);
    }
};

exports.criar = async (req, res, next) => {
    try {
        const plataforma = await service.criarPlataforma(req.body, req.user.id);

        return response.success(res, MSG.PLATAFORMA.CREATED, plataforma, HTTP.CREATED);
    } catch (error) {
        next(error);
    }
};

exports.atualizar = async (req, res, next) => {
    try {
        const plataforma = await service.atualizarPlataforma(req.params.id, req.body, req.user.id);

        return response.success(res, MSG.PLATAFORMA.UPDATED, plataforma, HTTP.OK);
    } catch (error) {
        next(error);
    }
};

exports.apagar = async (req, res, next) => {
    try {
        await service.apagarPlataforma(req.params.id, req.user.id);

        return response.success(res, MSG.PLATAFORMA.DELETED, null, HTTP.OK);
    } catch (error) {
        next(error);
    }
};