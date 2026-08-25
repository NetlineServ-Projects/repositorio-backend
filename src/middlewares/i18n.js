const { run } = require("../locales/context");

const IDIOMAS_SUPORTADOS = ["pt", "en"];
const IDIOMA_PADRAO = "pt";

function parseAcceptLanguage(header) {
    if (!header) return IDIOMA_PADRAO;

    // Ex: "en-US,en;q=0.9,pt;q=0.8" -> pega o primeiro idioma suportado
    const idiomas = header
        .split(",")
        .map((parte) => parte.split(";")[0].trim().slice(0, 2).toLowerCase());

    const encontrado = idiomas.find((idioma) => IDIOMAS_SUPORTADOS.includes(idioma));
    return encontrado || IDIOMA_PADRAO;
}

const languageMiddleware = (req, res, next) => {
    const lang = parseAcceptLanguage(req.headers["accept-language"]);

    req.lang = lang; // mantém disponível em req, caso precise em algum lugar específico
    run(lang, next); // e também no AsyncLocalStorage, pro Proxy do messages.js conseguir ler sem precisar de req
};

module.exports = languageMiddleware;