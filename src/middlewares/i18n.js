const languageMiddleware = (req, res, next) => {
  const acceptLanguage = req.headers['accept-language'];
  
  // Se o cabeçalho contiver 'en', define req.lang como 'en', senão 'pt'
  if (acceptLanguage && acceptLanguage.toLowerCase().includes('en')) {
    req.lang = 'en';
  } else {
    req.lang = 'pt';
  }
  
  next();
};

module.exports = languageMiddleware;