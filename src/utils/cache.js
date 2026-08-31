const NodeCache = require('node-cache');

// stdTTL em segundos; checkperiod = intervalo de limpeza automática de entradas expiradas
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

module.exports = cache;