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

