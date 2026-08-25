const { AsyncLocalStorage } = require("async_hooks");

const i18nContext = new AsyncLocalStorage();

function run(lang, callback) {
    i18nContext.run({ lang }, callback);
}

function getLang() {
    const store = i18nContext.getStore();
    return (store && store.lang) || "pt";
}

module.exports = { run, getLang };