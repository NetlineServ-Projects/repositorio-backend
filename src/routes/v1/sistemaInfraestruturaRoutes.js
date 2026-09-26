const { Router } = require("express");
const router = Router();

const sistemaInfraestruturaController = require("../../controllers/sistemaInfraestruturaController");
const authMiddleware = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/roleMiddleware");
const exigirReautenticacao = require("../../middlewares/exigirReautenticacao");
const validate = require("../../validators/validate");
const ROLES = require("../../constants/roles");

const {
  sistemaIdParamsSchema,
  infraestruturaParamsSchema,
  credencialParamsSchema,
  salvarInfraestruturaSchema,
  credencialSchema,
  credencialUpdateSchema,
} = require("../../validators/sistemaInfraestruturaValidator");

// Este router é montado em /sistemas (ver routes/index.js), a seguir ao
// sistemasRoutes. As cadeias de middlewares são aplicadas rota a rota e NÃO
// com router.use(): um router.use() sem caminho correria para qualquer pedido
// a /sistemas/* que chegasse aqui, e um 404 passaria a pedir reautenticação.
//
// Leitura: ADMIN e FUNCIONARIO — sessão válida → reautenticação recente
// (token elevado, 3 min).
const leitura = [authMiddleware, exigirReautenticacao];

// Escrita: exclusivo ADMIN. O perfil é verificado ANTES da reautenticação,
// para um FUNCIONARIO receber 403 logo, sem ter de introduzir a password.
const escrita = [authMiddleware, authorize(ROLES.ADMIN), exigirReautenticacao];

// Nas rotas abaixo, a validação vem depois da autenticação: quem não tem
// sessão nem token elevado não recebe detalhes de validação.

// ── Leitura ──────────────────────────────────────────────────────────────

// Ambientes que já têm infraestrutura registada (nada é desencriptado)
router.get(
  "/:sistemaId/infraestruturas",
  ...leitura,
  validate(sistemaIdParamsSchema, "params"),
  sistemaInfraestruturaController.listar
);

// Infraestrutura de um ambiente, desencriptada e auditada
router.get(
  "/:sistemaId/infraestruturas/:ambiente",
  ...leitura,
  validate(infraestruturaParamsSchema, "params"),
  sistemaInfraestruturaController.obter
);

// ── Escrita ──────────────────────────────────────────────────────────────

// Cria ou atualiza a infraestrutura de um ambiente (upsert)
router.put(
  "/:sistemaId/infraestruturas/:ambiente",
  ...escrita,
  validate(infraestruturaParamsSchema, "params"),
  validate(salvarInfraestruturaSchema),
  sistemaInfraestruturaController.salvar
);

router.post(
  "/:sistemaId/infraestruturas/:ambiente/credenciais",
  ...escrita,
  validate(infraestruturaParamsSchema, "params"),
  validate(credencialSchema),
  sistemaInfraestruturaController.adicionarCredencial
);

router.patch(
  "/:sistemaId/infraestruturas/:ambiente/credenciais/:credencialId",
  ...escrita,
  validate(credencialParamsSchema, "params"),
  validate(credencialUpdateSchema),
  sistemaInfraestruturaController.atualizarCredencial
);

router.delete(
  "/:sistemaId/infraestruturas/:ambiente/credenciais/:credencialId",
  ...escrita,
  validate(credencialParamsSchema, "params"),
  sistemaInfraestruturaController.apagarCredencial
);

module.exports = router;