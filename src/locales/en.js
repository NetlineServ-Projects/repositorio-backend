module.exports = {
    AUTH: {
        LOGIN_SUCCESS: "Login successful.",
        USER_NOT_FOUND: "User not found.",
        INVALID_PASSWORD: "Incorrect password.",

        TOKEN_NOT_PROVIDED: "Token not provided.",
        INVALID_TOKEN_FORMAT: "Invalid token format. Use: Bearer <token>.",
        INVALID_OR_EXPIRED_TOKEN: "Invalid or expired token.",

        UNAUTHORIZED: "User not authenticated.",
        FORBIDDEN: "You do not have permission to perform this action."
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
        NOT_FOUND: "System not found."
    },

    VALIDATION: {
        REQUIRED_FIELDS: "Please fill in all required fields.",
        INVALID_DATA: "The data provided is invalid.",
        INVALID_ID: "Invalid ID.",
        CATEGORIA_REQUIRED: "Category is required."
    },

    SERVER: {
        INTERNAL_ERROR: "An internal server error occurred."
    }
};