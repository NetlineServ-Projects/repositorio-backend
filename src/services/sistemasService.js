const prisma = require("../config/prisma");
const MSG = require("../utils/messages");
const HTTP_STATUS = require("../utils/httpsStatus");
const AppError = require("../utils/AppError");
const { parseId } = require("../utils/fileHelper");

const mapStatusToEnum = (status) => {
  const statusMap = {
    "Em Desenvolvimento": "EM_DESENVOLVIMENTO",
    "Em Produção": "EM_PRODUCAO",
    "Manutenção": "MANUTENCAO"
  };
  return statusMap[status] || "EM_DESENVOLVIMENTO";
};

const montarDadosSistema = (dados) => ({
  nome: dados.nome,
  descricaoCurta: dados.descricaoCurta || null,
  descricaoLonga: dados.descricaoLonga || null,
  status: mapStatusToEnum(dados.status),
  dataInicio: dados.dataInicio ? new Date(dados.dataInicio) : null,
  dataEntrega: dados.dataEntrega ? new Date(dados.dataEntrega) : null,
  desenvolvedores: dados.desenvolvedores || [],
  empresasClientes: dados.empresasClientes || [],
  tecnologiasFrontend: dados.tecnologiasFrontend || [],
  tecnologiasBackend: dados.tecnologiasBackend || [],
  tecnologiasInfraestrutura: dados.tecnologiasInfraestrutura || [],
  repositorioUrl: dados.repositorioUrl || null,
  urlProducao: dados.urlProducao || null,
  responsavelTecnico: dados.responsavelTecnico || null,
  versaoAtual: dados.versaoAtual || null,
  ativo: dados.ativo !== undefined ? dados.ativo : true
});

class SistemaService {
  async listarTodos() {
    const sistemas = await prisma.sistema.findMany({
      include: {
        _count: { select: { documentos: true } }
      },
      orderBy: { dataCriacao: "desc" }
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
      data: montarDadosSistema(dados)
    });
  }

  async atualizar(id, dados) {
    const idNum = parseId(id, MSG.VALIDATION.INVALID_ID);

    const sistemaExiste = await prisma.sistema.findUnique({ where: { id: idNum } });
    if (!sistemaExiste) throw new AppError(MSG.SISTEMA.NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    return await prisma.sistema.update({
      where: { id: idNum },
      data: montarDadosSistema(dados)
    });
  }

  async apagar(id) {
    const idNum = parseId(id, MSG.VALIDATION.INVALID_ID);

    const sistemaExiste = await prisma.sistema.findUnique({ where: { id: idNum } });
    if (!sistemaExiste) throw new AppError(MSG.SISTEMA.NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    return await prisma.sistema.delete({
      where: { id: idNum }
    });
  }

  async obterPorId(id) {
    const idNum = parseId(id, MSG.VALIDATION.INVALID_ID);

    const sistema = await prisma.sistema.findUnique({
      where: { id: idNum },
      include: { documentos: true }
    });

    if (!sistema) throw new AppError(MSG.SISTEMA.NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    return sistema;
  }
}

module.exports = new SistemaService();