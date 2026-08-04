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

exports.listarUsuarios = async () => {
    const usuarios = await prisma.usuario.findMany({
        orderBy: { dataCriacao: "desc" }
    });

    return usuarios.map(formatarUsuario);
};

exports.buscarUsuarioPorId = async (id) => {
    const usuario = await prisma.usuario.findUnique({
        where: { id: Number(id) }
    });

    if (!usuario) {
        throw new AppError(MSG.USER.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return formatarUsuario(usuario);
};

exports.buscarUsuarioPorId = async (id) => {
    const usuario = await prisma.usuario.findUnique({
        where: { id: Number(id) }
    });

    if (!usuario) {
        throw new AppError(MSG.USER.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return formatarUsuario(usuario);
};

exports.atualizarUsuario = async (id, dadosAtualizacao) => {
    const idNumero = Number(id);

    const usuarioExistente = await prisma.usuario.findUnique({
        where: { id: idNumero }
    });

    if (!usuarioExistente) {
        throw new AppError(MSG.USER.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Se houver alteração de email, verifica se já pertence a outro utilizador
    if (dadosAtualizacao.email && dadosAtualizacao.email !== usuarioExistente.email) {
        const emailEmUso = await prisma.usuario.findUnique({
            where: { email: dadosAtualizacao.email }
        });

        if (emailEmUso) {
            throw new AppError(MSG.USER.EMAIL_ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
        }
    }

    // Se enviou nova senha, gera o hash
    if (dadosAtualizacao.senha) {
        dadosAtualizacao.senha = await bcrypt.hash(dadosAtualizacao.senha, 10);
    }

    const usuarioAtualizado = await prisma.usuario.update({
        where: { id: idNumero },
        data: dadosAtualizacao
    });

    return formatarUsuario(usuarioAtualizado);
};

exports.eliminarUsuario = async (id) => {
    const idNumero = Number(id);

    const usuarioExistente = await prisma.usuario.findUnique({
        where: { id: idNumero }
    });

    if (!usuarioExistente) {
        throw new AppError(MSG.USER.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    await prisma.usuario.delete({
        where: { id: idNumero }
    });

    return true;
};