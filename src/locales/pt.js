module.exports = {
    AUTH: {
        LOGIN_SUCCESS: "Login realizado com sucesso.",
        USER_NOT_FOUND: "Utilizador não encontrado.",
        INVALID_PASSWORD: "Palavra-passe incorreta.",

        TOKEN_NOT_PROVIDED: "Token não fornecido.",
        INVALID_TOKEN_FORMAT: "Formato do token inválido. Utilize: Bearer <token>.",
        INVALID_OR_EXPIRED_TOKEN: "Token inválido ou expirado.",

        UNAUTHORIZED: "Utilizador não autenticado.",
        FORBIDDEN: "Não tem permissão para realizar esta ação.",
        REAUTENTICACAO_NECESSARIA: "É necessário reautenticar-se para aceder a estes dados.",
        TOKEN_INVALIDO: "Token elevado inválido.",
        REAUTENTICACAO_SUCESSO: "Reautenticação confirmada."
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
        NOT_FOUND: "Sistema não encontrado.",
        INFRAESTRUTURA_ATUALIZADA: "Dados de infraestrutura atualizados com sucesso.",
        CREDENCIAL_ADICIONADA: "Credencial adicionada com sucesso.",
        CREDENCIAL_APAGADA: "Credencial apagada com sucesso.",
        INFRAESTRUTURA_OBTIDA: "Infraestrutura obtida com sucesso.",
        INFRAESTRUTURA_SEM_DADOS: "Este sistema ainda não tem infraestrutura registada.",
        CREDENCIAL_ATUALIZADA: "Credencial atualizada com sucesso.",
        CREDENCIAL_NAO_ENCONTRADA: "Credencial não encontrada.",
        INFRA_NAO_ENCONTRADA: "Este ambiente ainda não tem infraestrutura registada. Crie-a primeiro.",
        INFRA_SERVIDOR_OU_PLATAFORMA: "Indique um servidor (servidorId) OU uma plataforma (plataformaId) — nunca os dois nem nenhum.",
        INFRA_NAO_AMBOS: "Não é possível associar um servidor e uma plataforma em simultâneo. Escolha apenas um.",
        INFRA_PLATAFORMA_INVALIDA: "Plataformas do tipo Gestão de domínio não podem receber sistemas directamente.",
    },
     
    PLATAFORMA: {
        CREATED: "Plataforma criada com sucesso.",
        UPDATED: "Plataforma atualizada com sucesso.",
        DELETED: "Plataforma apagada com sucesso.",
        OBTIDA: "Plataforma obtida com sucesso.",
        LISTADAS: "Plataformas obtidas com sucesso.",
        ARVORE_OBTIDA: "Árvore de plataformas obtida com sucesso.",
        NOT_FOUND: "Plataforma não encontrada.",
        NOME_JA_EXISTE: "Já existe uma plataforma com este nome.",
        TIPO_INCOMPATIVEL: "Não é possível alterar o tipo: a plataforma tem registos associados incompatíveis com o novo tipo.",
        TEM_DEPENDENCIAS: "Não é possível apagar a plataforma: ainda tem domínios, servidores ou sistemas associados.",
    },

    SERVIDOR: {
        CREATED: "Servidor criado com sucesso.",
        UPDATED: "Servidor atualizado com sucesso.",
        DELETED: "Servidor apagado com sucesso.",
        OBTIDO: "Servidor obtido com sucesso.",
        LISTADOS: "Servidores obtidos com sucesso.",
        NOT_FOUND: "Servidor não encontrado.",
        IP_JA_EXISTE: "Já existe um servidor com este IP nesta plataforma.",
        PLATAFORMA_INVALIDA: "Só é possível registar servidores em plataformas do tipo Cloud/Base de dados ou Containerização.",
        PLATAFORMA_INATIVA: "A plataforma selecionada está inativa.",
        TEM_DEPENDENCIAS: "Não é possível apagar o servidor: ainda tem subdomínios ou sistemas associados.",
        PASSWORD_OBTIDA: "Password do servidor obtida com sucesso.",
    },

    DOMINIO: {
        CREATED: "Domínio criado com sucesso.",
        UPDATED: "Domínio atualizado com sucesso.",
        DELETED: "Domínio apagado com sucesso.",
        OBTIDO: "Domínio obtido com sucesso.",
        LISTADOS: "Domínios obtidos com sucesso.",
        NOT_FOUND: "Domínio não encontrado.",
        NOME_JA_EXISTE: "Já existe um domínio com este nome.",
        PLATAFORMA_INVALIDA: "Só é possível registar domínios em plataformas do tipo Gestão de domínio.",
        PLATAFORMA_INATIVA: "A plataforma selecionada está inativa.",
        TEM_DEPENDENCIAS: "Não é possível apagar o domínio: ainda tem subdomínios associados.",
    },

    SUBDOMINIO: {
        CREATED: "Subdomínio criado com sucesso.",
        UPDATED: "Subdomínio atualizado com sucesso.",
        DELETED: "Subdomínio apagado com sucesso.",
        OBTIDO: "Subdomínio obtido com sucesso.",
        LISTADOS: "Subdomínios obtidos com sucesso.",
        NOT_FOUND: "Subdomínio não encontrado.",
        JA_EXISTE: "Já existe um registo deste tipo com este nome neste domínio.",
        SERVIDOR_OBRIGATORIO: "Os registos A e AAAA exigem um servidor de destino.",
        DESTINO_NAO_PERMITIDO: "Os registos A e AAAA apontam para um servidor e não devem ter destino.",
        DESTINO_OBRIGATORIO: "Este tipo de registo exige o campo destino.",
        SERVIDOR_NAO_PERMITIDO: "Só os registos A e AAAA podem apontar para um servidor.",
        CNAME_INVALIDO: "O destino de um registo CNAME deve ser um nome de domínio válido.",
        CNAME_CONFLITO: "Um nome com registo CNAME não pode ter outros registos, e vice-versa.",
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