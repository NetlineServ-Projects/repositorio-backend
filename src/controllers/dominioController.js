const service = require("../services/dominioService");
const response = require("../utils/response");
const HTTP = require("../utils/httpsStatus");
const MSG = require("../utils/messages");

// O id chega aqui já validado e convertido para número
// (ver validate(..., "params") em dominioRoutes.js).

exports.listar = async (req, res, next) => {
    try {
        const dominios = await service.listarDominios();

        return response.success(res, MSG.DOMINIO.LISTADOS, dominios, HTTP.OK);
    } catch (error) {
        next(error);
    }
};

exports.obter = async (req, res, next) => {
    try {
        const dominio = await service.obterDominio(req.params.id);

        return response.success(res, MSG.DOMINIO.OBTIDO, dominio, HTTP.OK);
    } catch (error) {
        next(error);
    }
};

exports.criar = async (req, res, next) => {
    try {
        const dominio = await service.criarDominio(req.body, req.user.id);

        return response.success(res, MSG.DOMINIO.CREATED, dominio, HTTP.CREATED);
    } catch (error) {
        next(error);
    }
};

exports.atualizar = async (req, res, next) => {
    try {
        const dominio = await service.atualizarDominio(req.params.id, req.body, req.user.id);

        return response.success(res, MSG.DOMINIO.UPDATED, dominio, HTTP.OK);
    } catch (error) {
        next(error);
    }
};

exports.apagar = async (req, res, next) => {
    try {
        await service.apagarDominio(req.params.id, req.user.id);

        return response.success(res, MSG.DOMINIO.DELETED, null, HTTP.OK);
    } catch (error) {
        next(error);
    }
};