const sistemaInfraestruturaService = require("../services/sistemaInfraestruturaService");
const HTTP = require("../utils/httpsStatus");
const MSG = require("../utils/messages");
const response = require("../utils/response");

// GET /sistemas/:id/infraestrutura — exige ADMIN + reautenticação (rota já protegida)
exports.obter = async (req, res, next) => {
  try {
    const sistemaId = Number(req.params.id);
    const infraestrutura = await sistemaInfraestruturaService.obterInfraestrutura(sistemaId, req.user.id);
    return response.success(res, null, infraestrutura, HTTP.OK);
  } catch (error) {
    next(error);
  }
};

// PUT /sistemas/:id/infraestrutura — exige ADMIN + reautenticação
exports.salvar = async (req, res, next) => {
  try {
    const sistemaId = Number(req.params.id);
    const infraestrutura = await sistemaInfraestruturaService.salvarInfraestrutura(sistemaId, req.body, req.user.id);
    return response.success(res, MSG.SISTEMA.INFRAESTRUTURA_ATUALIZADA, infraestrutura, HTTP.OK);
  } catch (error) {
    next(error);
  }
};

// POST /sistemas/:id/infraestrutura/credenciais — exige ADMIN + reautenticação
exports.adicionarCredencial = async (req, res, next) => {
  try {
    const sistemaId = Number(req.params.id);
    const credencial = await sistemaInfraestruturaService.adicionarCredencial(sistemaId, req.body, req.user.id);
    return response.success(res, MSG.SISTEMA.CREDENCIAL_ADICIONADA, credencial, HTTP.CREATED);
  } catch (error) {
    next(error);
  }
};

// DELETE /sistemas/infraestrutura/credenciais/:credencialId — exige ADMIN + reautenticação
exports.apagarCredencial = async (req, res, next) => {
  try {
    const credencialId = Number(req.params.credencialId);
    await sistemaInfraestruturaService.apagarCredencial(credencialId, req.user.id);
    return response.success(res, MSG.SISTEMA.CREDENCIAL_APAGADA, null, HTTP.OK);
  } catch (error) {
    next(error);
  }
};