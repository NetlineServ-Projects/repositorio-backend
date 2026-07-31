const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const MSG = require("../utils/messages");

// =======================================
// LOGIN
// =======================================

exports.login = async ({ email, senha }) => {

    // Procurar utilizador pelo email
    const user = await prisma.usuario.findUnique({
        where: { email }
    });

    if (!user) {
        throw new Error(MSG.AUTH.USER_NOT_FOUND);
    }

    // Verificar a palavra-passe
    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
        throw new Error(MSG.AUTH.INVALID_PASSWORD);
    }

    // Gerar o token JWT
    const token = jwt.sign(
        {
            id: user.id,
            nome: user.nome,
            email: user.email,
            perfil: user.perfil
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );

    // Resposta
    return {
        token,
        user: {
            id: user.id,
            nome: user.nome,
            email: user.email,
            numero: user.numero,
            cargo: user.cargo,
            perfil: user.perfil,
            ativo: user.ativo
        }
    };
};

// =======================================
// UTILIZADOR AUTENTICADO
// =======================================

exports.getUserById = async (id) => {

    return await prisma.usuario.findUnique({
        where: { id },
        select: {
            id: true,
            nome: true,
            email: true,
            numero: true,
            cargo: true,
            perfil: true,
            ativo: true,
            dataCriacao: true
        }
    });

};

exports.alterarSenha = async (userId, { senhaAtual, novaSenha }) => {

    const user = await prisma.usuario.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new Error(MSG.USER.NOT_FOUND);
    }

    const senhaValida = await bcrypt.compare(senhaAtual, user.senha);

    if (!senhaValida) {
        throw new Error(MSG.AUTH.INVALID_PASSWORD);
    }

    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

    await prisma.usuario.update({
        where: { id: userId },
        data: { senha: novaSenhaHash }
    });

    return { mensagem: "Palavra-passe alterada com sucesso." };
};