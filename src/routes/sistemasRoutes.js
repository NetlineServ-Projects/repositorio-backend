const { Router } = require('express');
const sistemaController = require('../controllers/sistemasController');

const router = Router();

router.get('/api/sistemas', sistemaController.listar);
router.post('/api/sistemas', sistemaController.criar);
router.put('/api/sistemas/:id', sistemaController.atualizar);
router.delete('/api/sistemas/:id', sistemaController.apagar);
router.get('/api/sistemas/:id', sistemaController.obterPorId);

module.exports = router;