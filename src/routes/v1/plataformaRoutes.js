const { Router } = require("express");
const router = Router();

const plataformaController = require("../../controllers/plataformaController");
const authMiddleware = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/roleMiddleware");
const validate = require("../../validators/validate");
const ROLES = require("../../constants/roles");
const exigirReautenticacao = require("../../middlewares/exigirReautenticacao");
const { uploadLogotipo } = require("../../config/multer");

const {
  criarPlataformaSchema,
  atualizarPlataformaSchema,
  plataformaIdParamsSchema,
} = require("../../validators/plataformaValidator");

// Leitura: qualquer utilizador autenticado (ADMIN e FUNCIONARIO).
// Escrita: exclusivo ADMIN.
// Revelar o token: exige reautenticação recente (token elevado, 3 min),
// tal como a password do servidor.
const leitura = [authMiddleware];
const escrita = [authMiddleware, authorize(ROLES.ADMIN)];
const leituraProtegida = [authMiddleware, exigirReautenticacao];

router.get("/", ...leitura, plataformaController.listar);

// Árvore completa de todas as plataformas
// NOTA: Tem de vir antes de "/:id" para não ser capturada como parâmetro
router.get("/arvore", ...leitura, plataformaController.obterArvore);

// Catálogo de fornecedores por tipo (para os dropdowns do formulário)
router.get("/fornecedores", ...leitura, plataformaController.listarFornecedores);

// Árvore de uma plataforma específica
router.get(
  "/:id/arvore",
  ...leitura,
  validate(plataformaIdParamsSchema, "params"),
  plataformaController.obterArvorePlataforma
);

router.get(
  "/:id/token",
  ...leituraProtegida,
  validate(plataformaIdParamsSchema, "params"),
  plataformaController.revelarToken
);

// Upload do logótipo (ADMIN; multipart/form-data, campo: "logotipo")
router.patch(
  "/:id/logotipo",
  ...escrita,
  validate(plataformaIdParamsSchema, "params"),
  uploadLogotipo.single("logotipo"),
  plataformaController.atualizarLogotipo
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