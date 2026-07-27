const documentoService = require("../services/documentoService");

exports.criarDocumento = async (req, res) => {
    try {
        // 1. Pega o utilizador do middleware (suporta req.usuario e req.user)
        const usuario = req.usuario || req.user;

        if (!usuario) {
            return res.status(401).json({ mensagem: "Utilizador não autenticado." });
        }

        // 2. Pega o ficheiro do Multer
        const ficheiro = req.file;
        if (!ficheiro) {
            return res.status(400).json({ mensagem: "Nenhum ficheiro foi enviado." });
        }

        // 3. Monta o objeto de dados a passar para o Service
        const dadosDocumento = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            nomeArquivo: ficheiro.originalname,
            caminho: ficheiro.path.replace(/\\/g, "/"),
            tipoArquivo: ficheiro.mimetype,
            tamanho: ficheiro.size,
            categoriaId: req.body.categoriaId
        };

        // 4. Chama o serviço passando (dados, usuario)
        const documentoCriado = await documentoService.criarDocumento(dadosDocumento, usuario);

        return res.status(201).json({
            mensagem: "Documento registado com sucesso!",
            documento: documentoCriado
        });

    } catch (error) {
        console.error("Erro no controller (criarDocumento):", error);
        return res.status(400).json({
            mensagem: error.message
        });
    }
};

exports.listarDocumentos = async (req, res) => {
    try {
        const documentos = await documentoService.listarDocumentos();
        return res.status(200).json(documentos);
    } catch (error) {
        return res.status(400).json({
            mensagem: error.message
        });
    }
};

exports.buscarDocumentoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const documento = await documentoService.buscarDocumentoPorId(id);
        return res.status(200).json(documento);
    } catch (error) {
        return res.status(404).json({
            mensagem: error.message
        });
    }
};

exports.aprovarDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        const documento = await documentoService.aprovarDocumento(id);
        return res.status(200).json(documento);
    } catch (error) {
        return res.status(400).json({
            mensagem: error.message
        });
    }
};

exports.rejeitarDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        const documento = await documentoService.rejeitarDocumento(id, req.body);
        return res.status(200).json(documento);
    } catch (error) {
        return res.status(400).json({
            mensagem: error.message
        });
    }
};



// MÉTODOS DE ATUALIZAÇÃO / LIXEIRA / ELIMINAÇÃO 
exports.atualizarDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        const dadosAtualizacao = req.body;

        if (!id) {
            return res.status(400).json({ mensagem: "O ID do documento é obrigatório." });
        }

        if (!dadosAtualizacao || Object.keys(dadosAtualizacao).length === 0) {
            return res.status(400).json({ mensagem: "Nenhum dado fornecido para atualização." });
        }

        const documentoAtualizado = await documentoService.atualizarDocumento(id, dadosAtualizacao);

        return res.status(200).json({
            mensagem: "Documento atualizado com sucesso!",
            documento: documentoAtualizado
        });
    } catch (error) {
        console.error("Erro no controller (atualizarDocumento):", error);
        return res.status(400).json({
            mensagem: error.message || "Erro ao atualizar documento."
        });
    }
};

// Elimina permanentemente o documento do banco de dados
 
exports.eliminarDocumento = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ mensagem: "O ID do documento é obrigatório." });
        }

        await documentoService.eliminarDocumento(id);

        return res.status(200).json({
            mensagem: "Documento eliminado definitivamente com sucesso."
        });
    } catch (error) {
        console.error("Erro no controller (eliminarDocumento):", error);
        return res.status(400).json({
            mensagem: error.message || "Erro ao eliminar documento."
        });
    }
};