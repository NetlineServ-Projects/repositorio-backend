const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mapeia os status que vêm do Frontend para o Enum do Prisma Schema
const mapStatusToEnum = (status) => {
  const statusMap = {
    "Em Desenvolvimento": "EM_DESENVOLVIMENTO",
    "Em Produção": "EM_PRODUCAO",
    "Manutenção": "EM_MANUTENCAO"
  };

  // Retorna o Enum correspondente ou mantém o valor padrão
  return statusMap[status] || "EM_DESENVOLVIMENTO";
};

class SistemaService {
  async listarTodos() {
    const sistemas = await prisma.sistema.findMany({
      include: {
        _count: {
          select: { documentos: true }
        }
      },
      orderBy: { dataCriacao: 'desc' } 
    });

    return sistemas.map((sis) => ({
      ...sis,
      desenvolvedores: sis.desenvolvedores || [],
      empresasClientes: sis.empresasClientes || [],
      tecnologias: sis.tecnologias || [],
      totalDocumentos: sis._count.documentos
    }));
  }

  async criar(dados) {
    return await prisma.sistema.create({
      data: {
        nome: dados.nome,
        descricaoCurta: dados.descricaoCurta || null,
        descricaoLonga: dados.descricaoLonga || null,
        status: mapStatusToEnum(dados.status),
        dataInicio: dados.dataInicio ? new Date(dados.dataInicio) : null,
        dataEntrega: dados.dataEntrega ? new Date(dados.dataEntrega) : null,
        desenvolvedores: dados.desenvolvedores || [],
        empresasClientes: dados.empresasClientes || [],
        tecnologias: dados.tecnologias || []
      }
    });
  }

  async atualizar(id, dados) {
    return await prisma.sistema.update({
      where: { id: Number(id) },
      data: {
        nome: dados.nome,
        descricaoCurta: dados.descricaoCurta || null,
        descricaoLonga: dados.descricaoLonga || null,
        status: mapStatusToEnum(dados.status), 
        dataInicio: dados.dataInicio ? new Date(dados.dataInicio) : null,
        dataEntrega: dados.dataEntrega ? new Date(dados.dataEntrega) : null,
        desenvolvedores: dados.desenvolvedores || [],
        empresasClientes: dados.empresasClientes || [],
        tecnologias: dados.tecnologias || []
      }
    });
  }

  async apagar(id) {
    return await prisma.sistema.delete({
      where: { id: Number(id) }
    });
  }

  async obterPorId(id) {
    return await prisma.sistema.findUnique({
      where: { id: Number(id) },
      include: { documentos: true }
    });
  }
}

module.exports = new SistemaService();