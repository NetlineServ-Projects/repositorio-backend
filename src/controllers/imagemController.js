const service = require("../services/imagemService");
const response = require("../utils/response");
const HTTP = require("../utils/httpsStatus");
const MSG = require("../utils/messages");

// O id chega aqui já validado e convertido para número
// (ver validate(..., "params") em imagemRoutes.js).

exports.listar = async (req, res, next) => {
    try {
        const imagens = await service.listarImagens();

        return response.success(res, MSG.IMAGEM.LISTADAS, imagens, HTTP.OK);
    } catch (error) {
        next(error);
    }
};

exports.obter = async (req, res, next) => {
    try {
        const imagem = await service.obterImagem(req.params.id);

        return response.success(res, MSG.IMAGEM.OBTIDA, imagem, HTTP.OK);
    } catch (error) {
        next(error);
    }
};

exports.criar = async (req, res, next) => {
    try {
        const imagem = await service.criarImagem(req.body, req.user.id);

        return response.success(res, MSG.IMAGEM.CREATED, imagem, HTTP.CREATED);
    } catch (error) {
        next(error);
    }
};

exports.atualizar = async (req, res, next) => {
    try {
        const imagem = await service.atualizarImagem(req.params.id, req.body, req.user.id);

        return response.success(res, MSG.IMAGEM.UPDATED, imagem, HTTP.OK);
    } catch (error) {
        next(error);
    }
};

exports.apagar = async (req, res, next) => {
    try {
        await service.apagarImagem(req.params.id, req.user.id);

        return response.success(res, MSG.IMAGEM.DELETED, null, HTTP.OK);
    } catch (error) {
        next(error);
    }
};