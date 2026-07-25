const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async ({ nome, email, senha, perfil }) => {
    // 1. Verifica se o email já existe
    const userExists = await prisma.usuario.findUnique({
        where: { email }
    });

    if (userExists) {
        throw new Error("Este email já está registado");
    }

    // 2. Hash da palavra-passe
    const senhaHash = await bcrypt.hash(senha, 10);

    // 3. Cria o utilizador com perfil definido (ou "USER" por defeito)
    const user = await prisma.usuario.create({
        data: {
            nome,
            email,
            senha: senhaHash,
            perfil: perfil || "FUNCIONARIO" // 👈 Atribui um perfil valor padrão se não vier nenhum
        }
    });

    // 4. Retorna os dados do utilizador (incluindo o perfil) sem expor a senha
    return {
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil: user.perfil
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

    // 🎯 INCLUÍMOS O PERFIL NO TOKEN JWT
    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            nome: user.nome,
            perfil: user.perfil // 👈 Linha crucial adicionada aqui!
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    return {
        token,
        user: {
            id: user.id,
            nome: user.nome,
            email: user.email,
            perfil: user.perfil // 👈 Também retornamos o perfil no objeto user
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

// DELETE USER BY ID (Adicionado e ajustado para prisma.usuario)
exports.deleteUserById = async (id) => {
    try {
        return await prisma.usuario.delete({
            where: { 
                id: Number(id) // Mantém o Number(id) caso o seu ID seja Int, remova o Number() se for String/UUID
            }
        });
    } catch (error) {
        // P2025 é o erro padrão do Prisma para "registro não encontrado"
        if (error.code === 'P2025') {
            throw new Error("Utilizador não encontrado");
        }
        throw error;
    }
};