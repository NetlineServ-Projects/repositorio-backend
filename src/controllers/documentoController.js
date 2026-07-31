const documentoService = require("../services/documentoService");
const HTTP = require("../utils/httpsStatus");
const MSG = require("../utils/messages");
const response = require("../utils/response");

exports.criarDocumento = async (req, res, next) => {
    try {
        const usuario = req.user;

        const ficheiro = req.file;
        if (!ficheiro) {
            return response.error(res, "Nenhum ficheiro foi enviado.", HTTP.BAD_REQUEST);
        }

        const dadosDocumento = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            nomeArquivo: ficheiro.originalname,
            caminho: ficheiro.path.replace(/\\/g, "/"),
            tipoArquivo: ficheiro.mimetype,
            tamanho: ficheiro.size,
            categoriaId: req.body.categoriaId
        };

        const documentoCriado = await documentoService.criarDocumento(dadosDocumento, usuario);

        return response.success(res, MSG.DOCUMENTO.CREATED, documentoCriado, HTTP.CREATED);
    } catch (error) {
        next(error);
    }
};

exports.listarDocumentos = async (req, res, next) => {
    try {
        const documentos = await documentoService.listarDocumentos();
        return response.success(res, null, documentos, HTTP.OK);
    } catch (error) {
        next(error);
    }
};

exports.buscarDocumentoPorId = async (req, res, next) => {
    try {
        const { id } = req.params;
        const documento = await documentoService.buscarDocumentoPorId(id);
        return response.success(res, null, documento, HTTP.OK);
    } catch (error) {
        next(error);
    }
};

exports.aprovarDocumento = async (req, res, next) => {
    try {
        const { id } = req.params;
        const documento = await documentoService.aprovarDocumento(id);
        return response.success(res, MSG.DOCUMENTO.APPROVED, documento, HTTP.OK);
    } catch (error) {
        next(error);
    }
};

exports.rejeitarDocumento = async (req, res, next) => {
    try {
        const { id } = req.params;
        const documento = await documentoService.rejeitarDocumento(id, req.body);
        return response.success(res, MSG.DOCUMENTO.REJECTED, documento, HTTP.OK);
    } catch (error) {
        next(error);
    }
};

exports.atualizarDocumento = async (req, res, next) => {
    try {
        const { id } = req.params;
        const dadosAtualizacao = req.body;

        if (!dadosAtualizacao || Object.keys(dadosAtualizacao).length === 0) {
            return response.error(res, "Nenhum dado fornecido para atualização.", HTTP.BAD_REQUEST);
        }

        const documentoAtualizado = await documentoService.atualizarDocumento(id, dadosAtualizacao);

        return response.success(res, MSG.DOCUMENTO.UPDATED, documentoAtualizado, HTTP.OK);
    } catch (error) {
        next(error);
    }
};

exports.eliminarDocumento = async (req, res, next) => {
    try {
        const { id } = req.params;
        await documentoService.eliminarDocumento(id);
        return response.success(res, MSG.DOCUMENTO.DELETED, null, HTTP.OK);
    } catch (error) {
        next(error);
    }
};