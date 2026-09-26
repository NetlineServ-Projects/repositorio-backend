const response = require("../utils/response");
const HTTP_STATUS = require("../utils/httpsStatus");
const MESSAGES = require("../utils/messages");

const FONTES_VALIDAS = ["body", "params"];

/**
 * Valida req.body (por omissão) ou req.params com um schema Zod.
 *
 *   validate(createUserSchema)                        -> valida o body
 *   validate(infraestruturaParamsSchema, "params")    -> valida os parâmetros do caminho
 */
const validate = (schema, source = "body") => {
    if (!FONTES_VALIDAS.includes(source)) {
        throw new Error(`validate: fonte inválida "${source}". Use "body" ou "params".`);
    }

    return (req, res, next) => {
        const result = schema.safeParse(req[source]);

        if (!result.success) {
            const erros = result.error.issues.map(issue => ({
                campo: issue.path.join("."),
                mensagem: issue.message
            }));

            return response.error(res, MESSAGES.VALIDATION.INVALID_DATA, HTTP_STATUS.UNPROCESSABLE_ENTITY, erros);
        }

        if (source === "body") {
            // Substitui o body pelos dados validados (remove campos desconhecidos)
            req.body = result.data;
        } else {
            // Mantém o mesmo objeto de params e aplica os valores convertidos (ex.: ids como número)
            Object.assign(req[source], result.data);
        }

        next();
    };
};

module.exports = validate;