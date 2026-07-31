const multer = require("multer");
const upload = require("../config/multer");
const response = require("../utils/response");
const HTTP_STATUS = require("../utils/httpsStatus");

function uploadMiddleware(req, res, next) {
    upload.single("arquivo")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return response.error(res, `Erro no upload: ${err.message}`, HTTP_STATUS.BAD_REQUEST);
        } else if (err) {
            return response.error(res, err.message, HTTP_STATUS.BAD_REQUEST);
        }

        if (!req.file) {
            return response.error(res, "Nenhum ficheiro foi enviado.", HTTP_STATUS.BAD_REQUEST);
        }

        next();
    });
}

module.exports = uploadMiddleware;


// Este é diferente do multer.js que está em config/. A separação faz sentido assim:
// config/multer.js → configuração técnica do multer 
// (onde salva, como nomeia, filtro de tipo/tamanho)
// middlewares/uploadMiddleware.js → usa essa configuração já pronta
//  e trata os erros específicos do multer
//  (arquivo grande demais, tipo inválido, campo errado) de forma padronizada,
//  antes de chegar no controller