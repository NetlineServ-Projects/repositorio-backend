const sistemaService = require('../services/sistemasService');

class SistemaController {
  async listar(req, res) {
    try {
      const sistemas = await sistemaService.listarTodos();
      return res.status(200).json(sistemas);
    } catch (error) {
      console.error('Erro ao listar sistemas:', error);
      return res.status(500).json({ error: 'Erro ao listar sistemas.' });
    }
  }

  async criar(req, res) {
    try {
      if (!req.body.nome) return res.status(400).json({ error: 'Nome é obrigatório.' });
      const novoSistema = await sistemaService.criar(req.body);
      return res.status(201).json(novoSistema);
    } catch (error) {
      console.error('Erro ao criar sistema:', error);
      return res.status(500).json({ error: 'Erro ao criar sistema.' });
    }
  }

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const sistemaAtualizado = await sistemaService.atualizar(id, req.body);
      return res.status(200).json(sistemaAtualizado);
    } catch (error) {
      console.error('Erro ao atualizar sistema:', error);
      return res.status(500).json({ error: 'Erro ao atualizar sistema.' });
    }
  }

  async apagar(req, res) {
    try {
      const { id } = req.params;
      await sistemaService.apagar(id);
      return res.status(200).json({ message: 'Sistema removido com sucesso.' });
    } catch (error) {
      console.error('Erro ao apagar sistema:', error);
      return res.status(500).json({ error: 'Erro ao apagar sistema.' });
    }
  }

  async obterPorId(req, res) {
    try {
      const { id } = req.params;
      const sistema = await sistemaService.obterPorId(id);
      if (!sistema) return res.status(404).json({ error: 'Sistema não encontrado.' });
      return res.status(200).json(sistema);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao obter detalhes.' });
    }
  }
}

module.exports = new SistemaController();