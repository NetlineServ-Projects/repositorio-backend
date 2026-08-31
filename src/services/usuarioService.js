const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");

const MSG = require("../utils/messages");
const HTTP_STATUS = require("../utils/httpsStatus");
const ROLES = require("../constants/roles");
const AppError = require("../utils/AppError");
const { formatarUsuario } = require("../utils/fileHelper");
const fs = require("fs/promises");
const path = require("path");


const CAMPOS_PERMITIDOS_ATUALIZACAO = ["nome", "email", "senha", "numero", "cargo", "departamento", "perfil", "ativo"];

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

exports.atualizarUsuario = async (id, dadosAtualizacao) => {
    const idNumero = Number(id);

    const usuarioExistente = await prisma.usuario.findUnique({
        where: { id: idNumero }
    });

    if (!usuarioExistente) {
        throw new AppError(MSG.USER.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Filtra apenas os campos permitidos vindos do body (evita mass assignment)
    const dados = {};
    for (const campo of CAMPOS_PERMITIDOS_ATUALIZACAO) {
        if (dadosAtualizacao[campo] !== undefined) dados[campo] = dadosAtualizacao[campo];
    }

    // Se houver alteração de email, verifica se já pertence a outro utilizador
    if (dados.email && dados.email !== usuarioExistente.email) {
        const emailEmUso = await prisma.usuario.findUnique({
            where: { email: dados.email }
        });

        if (emailEmUso) {
            throw new AppError(MSG.USER.EMAIL_ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
        }
    }

    // Se enviou nova senha, gera o hash
    if (dados.senha) {
        dados.senha = await bcrypt.hash(dados.senha, 10);
    }

    const usuarioAtualizado = await prisma.usuario.update({
        where: { id: idNumero },
        data: dados
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

exports.atualizarPreferencias = async (userId, { temaEscuro, notificacoesEmail, idioma }) => {
    const dados = {};

    if (typeof temaEscuro === "boolean") dados.temaEscuro = temaEscuro;
    if (typeof notificacoesEmail === "boolean") dados.notificacoesEmail = notificacoesEmail;
    if (typeof idioma === "string") dados.idioma = idioma;

    const usuarioAtualizado = await prisma.usuario.update({
        where: { id: userId },
        data: dados
    });

    return formatarUsuario(usuarioAtualizado);
};



exports.atualizarFotografia = async (userId, urlFotografia) => {
    const usuarioExistente = await prisma.usuario.findUnique({
        where: { id: userId }
    });

    if (!usuarioExistente) {
        throw new AppError(MSG.USER.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const usuarioAtualizado = await prisma.usuario.update({
        where: { id: userId },
        data: { fotografia: urlFotografia }
    });

    if (usuarioExistente.fotografia) {
        const caminhoAntigo = path.join("uploads/avatars", path.basename(usuarioExistente.fotografia));
        fs.unlink(caminhoAntigo).catch(() => {});
    }

    return formatarUsuario(usuarioAtualizado);
};