const { getLang } = require("../locales/context");
const pt = require("../locales/pt");
const en = require("../locales/en");

const IDIOMAS = { pt, en };

// Proxy: qualquer acesso a MESSAGES.AUTH, MESSAGES.DOCUMENTO, etc.
// é redirecionado, em tempo real, para o locale correto da requisição atual
const messages = new Proxy(
    {},
    {
        get(_target, chave) {
            const lang = getLang();
            const dicionario = IDIOMAS[lang] || IDIOMAS.pt;
            return dicionario[chave];
        },
    }
);

module.exports = messages;