const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");

const MSG = require("../utils/messages");
const ROLES = require("../constants/roles");

// =======================================
// CRIAR UTILIZADOR
// =======================================

exports.criarUsuario = async ({ nome, email, senha, numero, cargo, perfil }) => {

    const usuarioExistente = await prisma.usuario.findUnique({
        where: { email }
    });

    if (usuarioExistente) {
       throw new Error(MSG.USER.EMAIL_ALREADY_EXISTS);
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

    return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        numero: usuario.numero,
        cargo: usuario.cargo,
        perfil: usuario.perfil,
        ativo: usuario.ativo,
        dataCriacao: usuario.dataCriacao
    };
};