module.exports = {
    AUTH: {
        LOGIN_SUCCESS: "Login successful.",
        USER_NOT_FOUND: "User not found.",
        INVALID_PASSWORD: "Incorrect password.",

        TOKEN_NOT_PROVIDED: "Token not provided.",
        INVALID_TOKEN_FORMAT: "Invalid token format. Use: Bearer <token>.",
        INVALID_OR_EXPIRED_TOKEN: "Invalid or expired token.",

        UNAUTHORIZED: "User not authenticated.",
        FORBIDDEN: "You do not have permission to perform this action.",
        REAUTENTICACAO_NECESSARIA: "Re-authentication is required to access this data.",
        TOKEN_INVALIDO: "Invalid elevated token.",
        REAUTENTICACAO_SUCESSO: "Re-authentication confirmed."
    },

    USER: {
        CREATED: "User created successfully.",
        UPDATED: "User updated successfully.",
        DELETED: "User deleted successfully.",
        NOT_FOUND: "User not found.",
        EMAIL_ALREADY_EXISTS: "A user with this email already exists."
    },

    DOCUMENTO: {
        CREATED: "Document created successfully.",
        UPDATED: "Document updated successfully.",
        DELETED: "Document moved to trash.",
        APPROVED: "Document approved successfully.",
        REJECTED: "Document rejected successfully.",
        NOT_FOUND: "Document not found."
    },

    CATEGORIA: {
        CREATED: "Category created successfully.",
        UPDATED: "Category updated successfully.",
        DELETED: "Category deleted successfully.",
        NOT_FOUND: "Category not found."
    },

    SISTEMA: {
        CREATED: "System created successfully.",
        UPDATED: "System updated successfully.",
        DELETED: "System deleted successfully.",
        NOT_FOUND: "System not found.",
        INFRAESTRUTURA_ATUALIZADA: "Infrastructure data successfully updated.",
        CREDENCIAL_ADICIONADA: "Credential successfully added.",
        CREDENCIAL_APAGADA: "Credential successfully deleted.",
        INFRAESTRUTURA_OBTIDA: "Infrastructure obtained successfully.",
        INFRAESTRUTURA_SEM_DADOS: "This system does not have infrastructure data registered yet.",
        CREDENCIAL_ATUALIZADA: "Credential successfully updated.",
        CREDENCIAL_NAO_ENCONTRADA: "Credential not found."
    },
     PLATAFORMA: {
        CREATED: "Platform created successfully.",
        UPDATED: "Platform updated successfully.",
        DELETED: "Platform deleted successfully.",
        OBTIDA: "Platform retrieved successfully.",
        LISTADAS: "Platforms retrieved successfully.",
        NOT_FOUND: "Platform not found.",
        NOME_JA_EXISTE: "A platform with this name already exists.",
        TIPO_INCOMPATIVEL: "The type cannot be changed: the platform has linked records that are incompatible with the new type.",
        TEM_DEPENDENCIAS: "The platform cannot be deleted: it still has domains, servers or systems linked to it.",
    },
    
    SERVIDOR: {
        CREATED: "Server created successfully.",
        UPDATED: "Server updated successfully.",
        DELETED: "Server deleted successfully.",
        OBTIDO: "Server retrieved successfully.",
        LISTADOS: "Servers retrieved successfully.",
        NOT_FOUND: "Server not found.",
        IP_JA_EXISTE: "A server with this IP already exists on this platform.",
        PLATAFORMA_INVALIDA: "Servers can only be registered on Cloud/Database or Containerization platforms.",
        PLATAFORMA_INATIVA: "The selected platform is inactive.",
        TEM_DEPENDENCIAS: "The server cannot be deleted: it still has subdomains or systems linked to it.",
        PASSWORD_OBTIDA: "Server password retrieved successfully.",
    },
     
    DOMINIO: {
        CREATED: "Domain created successfully.",
        UPDATED: "Domain updated successfully.",
        DELETED: "Domain deleted successfully.",
        OBTIDO: "Domain retrieved successfully.",
        LISTADOS: "Domains retrieved successfully.",
        NOT_FOUND: "Domain not found.",
        NOME_JA_EXISTE: "A domain with this name already exists.",
        PLATAFORMA_INVALIDA: "Domains can only be registered on Domain management platforms.",
        PLATAFORMA_INATIVA: "The selected platform is inactive.",
        TEM_DEPENDENCIAS: "The domain cannot be deleted: it still has subdomains linked to it.",
    }, 

       
    SUBDOMINIO: {
        CREATED: "Subdomain created successfully.",
        UPDATED: "Subdomain updated successfully.",
        DELETED: "Subdomain deleted successfully.",
        OBTIDO: "Subdomain retrieved successfully.",
        LISTADOS: "Subdomains retrieved successfully.",
        NOT_FOUND: "Subdomain not found.",
        JA_EXISTE: "A record of this type with this name already exists in this domain.",
        SERVIDOR_OBRIGATORIO: "A and AAAA records require a destination server.",
        DESTINO_NAO_PERMITIDO: "A and AAAA records point to a server and must not have a destination value.",
        DESTINO_OBRIGATORIO: "This record type requires the destination field.",
        SERVIDOR_NAO_PERMITIDO: "Only A and AAAA records can point to a server.",
        CNAME_INVALIDO: "The destination of a CNAME record must be a valid domain name.",
        CNAME_CONFLITO: "A name with a CNAME record cannot have other records, and vice versa.",
    },

    VALIDATION: {
      REQUIRED_FIELDS: "Please fill in all required fields.",
      INVALID_DATA: "The data provided is invalid.",
      INVALID_ID: "Invalid ID.",
      CATEGORIA_REQUIRED: "Category is required.",
      FILE_TOO_LARGE: "The file exceeds the maximum allowed size (50MB).",
      INVALID_DOCUMENT_TYPE: "File type not allowed. Accepted formats: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG.",
      NO_FILE_UPLOADED: "No file was uploaded."
    },

    SERVER: {
        INTERNAL_ERROR: "An internal server error occurred."
    }
};