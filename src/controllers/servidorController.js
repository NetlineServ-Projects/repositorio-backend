const service = require("../services/servidorService");
const response = require("../utils/response");
const HTTP = require("../utils/httpsStatus");
const MSG = require("../utils/messages");

// O id chega aqui já validado e convertido para número
// (ver validate(..., "params") em servidorRoutes.js).

exports.listar = async (req, res, next) => {
    try {
        const servidores = await service.listarServidores();

        return response.success(res, MSG.SERVIDOR.LISTADOS, servidores, HTTP.OK);
    } catch (error) {
        next(error);
    }
};

exports.obter = async (req, res, next) => {
    try {
        const servidor = await service.obterServidor(req.params.id);

        return response.success(res, MSG.SERVIDOR.OBTIDO, servidor, HTTP.OK);
    } catch (error) {
        next(error);
    }
};

exports.criar = async (req, res, next) => {
    try {
        const servidor = await service.criarServidor(req.body, req.user.id);

        return response.success(res, MSG.SERVIDOR.CREATED, servidor, HTTP.CREATED);
    } catch (error) {
        next(error);
    }
};

exports.atualizar = async (req, res, next) => {
    try {
        const servidor = await service.atualizarServidor(req.params.id, req.body, req.user.id);

        return response.success(res, MSG.SERVIDOR.UPDATED, servidor, HTTP.OK);
    } catch (error) {
        next(error);
    }
};

exports.apagar = async (req, res, next) => {
    try {
        await service.apagarServidor(req.params.id, req.user.id);

        return response.success(res, MSG.SERVIDOR.DELETED, null, HTTP.OK);
    } catch (error) {
        next(error);
    }
};

exports.revelarPassword = async (req, res, next) => {
    try {
        const resultado = await service.revelarPassword(req.params.id, req.user.id);

        // Um segredo nunca deve ficar em cache do browser nem de proxies
        res.set("Cache-Control", "no-store");

        return response.success(res, MSG.SERVIDOR.PASSWORD_OBTIDA, resultado, HTTP.OK);
    } catch (error) {
        next(error);
    }
};