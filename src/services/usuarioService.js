const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");

const MSG = require("../utils/messages");
const HTTP_STATUS = require("../utils/httpsStatus");
const ROLES = require("../constants/roles");
const AppError = require("../utils/AppError");
const { formatarUsuario } = require("../utils/fileHelper");

exports.criarUsuario = async ({ nome, email, senha, numero, cargo, perfil }) => {

    const usuarioExistente = await prisma.usuario.findUnique({
        where: { email }
    });

    if (usuarioExistente) {
        throw new AppError(MSG.USER.EMAIL_ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.create({
        data: {
            nome,
            email,
            senha: senhaHash,
            numero,
            cargo,
            perfil: perfil || ROLES.FUNCIONARIO
        }
    });

    return formatarUsuario(usuario);
};