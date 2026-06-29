const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async ({ nome, email, senha }) => {
    const userExists = await prisma.usuario.findUnique({
        where: { email }
    });

    if (userExists) {
        throw new Error("Este email já está registado");
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const user = await prisma.usuario.create({
        data: {
            nome,
            email,
            senha: senhaHash
        }
    });

    return {
        id: user.id,
        nome: user.nome,
        email: user.email
    };
};

// LOGIN
exports.login = async ({ email, senha }) => {
    const user = await prisma.usuario.findUnique({
        where: { email }
    });

    if (!user) {
        throw new Error("Utilizador não encontrado");
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
        throw new Error("Senha inválida");
    }

    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            nome: user.nome
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    return {
        token,
        user: {
            id: user.id,
            nome: user.nome,
            email: user.email
        }
    };
};

// GET USER BY ID (ME)
exports.getUserById = async (id) => {
    return await prisma.usuario.findUnique({
        where: { id },
        select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
            dataCriacao: true
        }
    });
};