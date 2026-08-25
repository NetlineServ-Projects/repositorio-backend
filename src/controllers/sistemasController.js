const sistemaService = require("../services/sistemasService");
const HTTP = require("../utils/httpsStatus");
const MSG = require("../utils/messages");
const response = require("../utils/response");

class SistemaController {
  async listar(req, res, next) {
    try {
      const sistemas = await sistemaService.listarTodos();
      return response.success(res, null, sistemas, HTTP.OK);
    } catch (error) {
      next(error);
    }
  }

  async criar(req, res, next) {
    try {
      const novoSistema = await sistemaService.criar(req.body, req.user.nome);
      return response.success(res, MSG.SISTEMA.CREATED, novoSistema, HTTP.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const sistemaAtualizado = await sistemaService.atualizar(id, req.body, req.user.nome);
      return response.success(res, MSG.SISTEMA.UPDATED, sistemaAtualizado, HTTP.OK);
    } catch (error) {
      next(error);
    }
  }

  async apagar(req, res, next) {
    try {
      const { id } = req.params;
      await sistemaService.apagar(id, req.user.nome);
      return response.success(res, MSG.SISTEMA.DELETED, null, HTTP.OK);
    } catch (error) {
      next(error);
    }
  }

  async obterPorId(req, res, next) {
    try {
      const { id } = req.params;
      const sistema = await sistemaService.obterPorId(id);
      if (!sistema) {
        return response.error(res, MSG.SISTEMA.NOT_FOUND, HTTP.NOT_FOUND);
      }
      return response.success(res, null, sistema, HTTP.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SistemaController();