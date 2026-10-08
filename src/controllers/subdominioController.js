const service = require("../services/subdominioService");
const response = require("../utils/response");
const HTTP = require("../utils/httpsStatus");
const MSG = require("../utils/messages");

// O id chega aqui já validado e convertido para número
// (ver validate(..., "params") em subdominioRoutes.js).

exports.listar = async (req, res, next) => {
    try {
        const subdominios = await service.listarSubdominios();

        return response.success(res, MSG.SUBDOMINIO.LISTADOS, subdominios, HTTP.OK);
    } catch (error) {
        next(error);
    }
};

exports.obter = async (req, res, next) => {
    try {
        const subdominio = await service.obterSubdominio(req.params.id);

        return response.success(res, MSG.SUBDOMINIO.OBTIDO, subdominio, HTTP.OK);
    } catch (error) {
        next(error);
    }
};

exports.criar = async (req, res, next) => {
    try {
        const subdominio = await service.criarSubdominio(req.body, req.user.id);

        return response.success(res, MSG.SUBDOMINIO.CREATED, subdominio, HTTP.CREATED);
    } catch (error) {
        next(error);
    }
};

exports.atualizar = async (req, res, next) => {
    try {
        const subdominio = await service.atualizarSubdominio(req.params.id, req.body, req.user.id);

        return response.success(res, MSG.SUBDOMINIO.UPDATED, subdominio, HTTP.OK);
    } catch (error) {
        next(error);
    }
};

exports.apagar = async (req, res, next) => {
    try {
        await service.apagarSubdominio(req.params.id, req.user.id);

        return response.success(res, MSG.SUBDOMINIO.DELETED, null, HTTP.OK);
    } catch (error) {
        next(error);
    }
};