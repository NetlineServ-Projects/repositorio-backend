const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");

// =======================
// CRIAR FUNCIONÁRIO + USUÁRIO
// =======================
exports.criarFuncionario = async ({ nome, email, senha, telefone }) => {

    // 1. Verificar se email já existe
    const userExists = await prisma.usuario.findUnique({
        where: { email }
    });

    if (userExists) {
        throw new Error("Este email já está registado");
    }

    // 2. Encriptar senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // 3. Criar usuário + funcionário na mesma operação
    const funcionario = await prisma.usuario.create({
        data: {
            nome,
            email,
            senha: senhaHash,
            perfil: "FUNCIONARIO",

            funcionario: {
                create: {
                    telefone
                }
            }
        },
        include: {
            funcionario: true
        }
    });

    return {
        id: funcionario.id,
        nome: funcionario.nome,
        email: funcionario.email,
        telefone: funcionario.funcionario.telefone,
        perfil: funcionario.perfil
    };
};

// LISTAR TODOS OS FUNCIONÁRIOS
exports.listarFuncionarios = async () => {

    const funcionarios = await prisma.funcionario.findMany({
        include: {
            usuario: {
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    perfil: true,
                    dataCriacao: true
                }
            }
        }
    });

    return funcionarios.map(func => ({
        id: func.id,
        telefone: func.telefone,
        dataCriacao: func.dataCriacao,
        usuario: func.usuario
    }));
};