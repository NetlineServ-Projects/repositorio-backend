const service = require("../services/sistemaInfraestruturaService");
const response = require("../utils/response");
const HTTP = require("../utils/httpsStatus");
const MSG = require("../utils/messages");

// Os parâmetros de rota chegam aqui já validados e convertidos
// (ver validate(..., "params") em sistemaInfraestruturaRoutes.js).

exports.listar = async (req, res, next) => {
    try {
        const { sistemaId } = req.params;
        const infraestruturas = await service.listarInfraestruturas(sistemaId);

        return response.success(res, MSG.SISTEMA.INFRAESTRUTURA_OBTIDA, infraestruturas, HTTP.OK);
    } catch (error) {
        next(error);
    }
};

exports.obter = async (req, res, next) => {
    try {
        const { sistemaId, ambiente } = req.params;
        const infraestrutura = await service.obterInfraestrutura(sistemaId, ambiente, req.user.id);

        return response.success(
            res,
            infraestrutura ? MSG.SISTEMA.INFRAESTRUTURA_OBTIDA : MSG.SISTEMA.INFRAESTRUTURA_SEM_DADOS,
            infraestrutura,
            HTTP.OK
        );
    } catch (error) {
        next(error);
    }
};

exports.salvar = async (req, res, next) => {
    try {
        const { sistemaId, ambiente } = req.params;
        const resultado = await service.salvarInfraestrutura(sistemaId, ambiente, req.body, req.user.id);

        return response.success(res, MSG.SISTEMA.INFRAESTRUTURA_ATUALIZADA, resultado, HTTP.OK);
    } catch (error) {
        next(error);
    }
};

exports.adicionarCredencial = async (req, res, next) => {
    try {
        const { sistemaId, ambiente } = req.params;
        const credencial = await service.adicionarCredencial(sistemaId, ambiente, req.body, req.user.id);

        return response.success(res, MSG.SISTEMA.CREDENCIAL_ADICIONADA, credencial, HTTP.CREATED);
    } catch (error) {
        next(error);
    }
};

exports.atualizarCredencial = async (req, res, next) => {
    try {
        const { sistemaId, ambiente, credencialId } = req.params;
        const credencial = await service.atualizarCredencial(sistemaId, ambiente, credencialId, req.body, req.user.id);

        return response.success(res, MSG.SISTEMA.CREDENCIAL_ATUALIZADA, credencial, HTTP.OK);
    } catch (error) {
        next(error);
    }
};

exports.apagarCredencial = async (req, res, next) => {
    try {
        const { sistemaId, ambiente, credencialId } = req.params;
        await service.apagarCredencial(sistemaId, ambiente, credencialId, req.user.id);

        return response.success(res, MSG.SISTEMA.CREDENCIAL_APAGADA, null, HTTP.OK);
    } catch (error) {
        next(error);
    }
};