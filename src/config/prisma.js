const { PrismaClient } = require("@prisma/client");

// Cria uma instância única do PrismaClient
const prisma = new PrismaClient();

// Exporta o prisma para ser usado em todo o projeto
module.exports = prisma;