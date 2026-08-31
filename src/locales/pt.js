module.exports = {
    AUTH: {
        LOGIN_SUCCESS: "Login realizado com sucesso.",
        USER_NOT_FOUND: "Utilizador não encontrado.",
        INVALID_PASSWORD: "Palavra-passe incorreta.",

        TOKEN_NOT_PROVIDED: "Token não fornecido.",
        INVALID_TOKEN_FORMAT: "Formato do token inválido. Utilize: Bearer <token>.",
        INVALID_OR_EXPIRED_TOKEN: "Token inválido ou expirado.",

        UNAUTHORIZED: "Utilizador não autenticado.",
        FORBIDDEN: "Não tem permissão para realizar esta ação."
    },

    USER: {
        CREATED: "Utilizador criado com sucesso.",
        UPDATED: "Utilizador atualizado com sucesso.",
        DELETED: "Utilizador eliminado com sucesso.",
        NOT_FOUND: "Utilizador não encontrado.",
        EMAIL_ALREADY_EXISTS: "Já existe um utilizador com este email."
    },

    DOCUMENTO: {
        CREATED: "Documento criado com sucesso.",
        UPDATED: "Documento atualizado com sucesso.",
        DELETED: "Documento movido para a lixeira.",
        APPROVED: "Documento aprovado com sucesso.",
        REJECTED: "Documento rejeitado com sucesso.",
        NOT_FOUND: "Documento não encontrado."
    },

    CATEGORIA: {
        CREATED: "Categoria criada com sucesso.",
        UPDATED: "Categoria atualizada com sucesso.",
        DELETED: "Categoria eliminada com sucesso.",
        NOT_FOUND: "Categoria não encontrada."
    },

    SISTEMA: {
        CREATED: "Sistema criado com sucesso.",
        UPDATED: "Sistema atualizado com sucesso.",
        DELETED: "Sistema eliminado com sucesso.",
        NOT_FOUND: "Sistema não encontrado."
    },

    VALIDATION: {
        REQUIRED_FIELDS: "Preencha todos os campos obrigatórios.",
        INVALID_DATA: "Os dados fornecidos são inválidos.",
        INVALID_ID: "ID inválido.",
        CATEGORIA_REQUIRED: "A categoria é obrigatória.",
        FILE_TOO_LARGE: "O ficheiro excede o tamanho máximo permitido (50MB).",
        INVALID_DOCUMENT_TYPE: "Tipo de ficheiro não permitido. Formatos aceites: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG.",
        NO_FILE_UPLOADED: "Nenhum ficheiro foi enviado."
    },

    SERVER: {
        INTERNAL_ERROR: "Ocorreu um erro interno no servidor."
    }
};