const { Router } = require("express");
const router = Router();

const plataformaController = require("../../controllers/plataformaController");
const authMiddleware = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/roleMiddleware");
const validate = require("../../validators/validate");
const ROLES = require("../../constants/roles");

const {
  criarPlataformaSchema,
  atualizarPlataformaSchema,
  plataformaIdParamsSchema,
} = require("../../validators/plataformaValidator");

// Leitura: qualquer utilizador autenticado (ADMIN e FUNCIONARIO).
// Escrita: exclusivo ADMIN. Não há reautenticação: a plataforma não guarda
// dados sensíveis (isso fica para o Servidor).
const leitura = [authMiddleware];
const escrita = [authMiddleware, authorize(ROLES.ADMIN)];

router.get("/", ...leitura, plataformaController.listar);

// Árvore completa de todas as plataformas
// NOTA: Tem de vir antes de "/:id" para não ser capturada como parâmetro
router.get("/arvore", ...leitura, plataformaController.obterArvore);

// Árvore de uma plataforma específica
router.get(
  "/:id/arvore",
  ...leitura,
  validate(plataformaIdParamsSchema, "params"),
  plataformaController.obterArvorePlataforma
);

router.get(
  "/:id",
  ...leitura,
  validate(plataformaIdParamsSchema, "params"),
  plataformaController.obter
);

router.post(
  "/",
  ...escrita,
  validate(criarPlataformaSchema),
  plataformaController.criar
);

router.patch(
  "/:id",
  ...escrita,
  validate(plataformaIdParamsSchema, "params"),
  validate(atualizarPlataformaSchema),
  plataformaController.atualizar
);

router.delete(
  "/:id",
  ...escrita,
  validate(plataformaIdParamsSchema, "params"),
  plataformaController.apagar
);

module.exports = router;