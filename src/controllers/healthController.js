const HTTP = require("../utils/httpsStatus");
const response = require("../utils/response");

exports.verificarSaude = async (req, res, next) => {
  try {
    const dados = {
      status: "OK",
      servico: "API",
      ambiente: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
    };

    return response.success(
      res,
      "Servidor está saudável",
      dados,
      HTTP.OK
    );
  } catch (error) {
    next(error);
  }
};