const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const MSG = require("../utils/messages");
const HTTP_STATUS = require("../utils/httpsStatus");
const AppError = require("../utils/AppError");
const { formatarUsuario } = require("../utils/fileHelper");


// LOGIN
exports.login = async ({ email, senha }) => {

    const user = await prisma.usuario.findUnique({
        where: { email }
    });

    if (!user) {
        throw new AppError(MSG.AUTH.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
        throw new AppError(MSG.AUTH.INVALID_PASSWORD, HTTP_STATUS.UNAUTHORIZED);
    }

    const token = jwt.sign(
        {
            id: user.id,
            nome: user.nome,
            email: user.email,
            perfil: user.perfil
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    return {
        token,
        user: formatarUsuario(user)
    };
};

// UTILIZADOR AUTENTICADO
exports.getUserById = async (id) => {

    const user = await prisma.usuario.findUnique({
        where: { id }
    });

    if (!user) {
        return null;
    }

    return formatarUsuario(user);
};

// ALTERAR SENHA (opcional, feito pelo próprio utilizador)
exports.alterarSenha = async (userId, { senhaAtual, novaSenha }) => {

    const user = await prisma.usuario.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new AppError(MSG.USER.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const senhaValida = await bcrypt.compare(senhaAtual, user.senha);

    if (!senhaValida) {
        throw new AppError(MSG.AUTH.INVALID_PASSWORD, HTTP_STATUS.UNAUTHORIZED);
    }

    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

    await prisma.usuario.update({
        where: { id: userId },
        data: { senha: novaSenhaHash }
    });

    return { mensagem: "Palavra-passe alterada com sucesso." };
};