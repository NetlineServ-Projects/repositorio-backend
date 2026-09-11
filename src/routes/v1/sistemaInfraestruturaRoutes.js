const express = require("express");
const router = express.Router({ mergeParams: true });

const sistemaInfraestruturaController = require("../../controllers/sistemaInfraestruturaController");
const authMiddleware = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/roleMiddleware");
const exigirReautenticacao = require("../../middlewares/exigirReautenticacao");
const validate = require("../../validators/validate");

const {
  salvarInfraestruturaSchema,
  adicionarCredencialSchema,
} = require("../../validators/sistemaInfraestruturaValidator");

// Cadeia de proteção igual em todas as rotas: sessão válida → perfil ADMIN → reautenticação recente
const protegido = [authMiddleware, authorize("ADMIN"), exigirReautenticacao];

router.get("/:id/infraestrutura", ...protegido, sistemaInfraestruturaController.obter);

router.put(
  "/:id/infraestrutura",
  ...protegido,
  validate(salvarInfraestruturaSchema),
  sistemaInfraestruturaController.salvar
);

router.post(
  "/:id/infraestrutura/credenciais",
  ...protegido,
  validate(adicionarCredencialSchema),
  sistemaInfraestruturaController.adicionarCredencial
);

router.delete(
  "/infraestrutura/credenciais/:credencialId",
  ...protegido,
  sistemaInfraestruturaController.apagarCredencial
);

module.exports = router;