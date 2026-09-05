const prisma = require("../config/prisma");
const MSG = require("../utils/messages");
const HTTP_STATUS = require("../utils/httpsStatus");
const AppError = require("../utils/AppError");
const { parseId } = require("../utils/fileHelper");
const atividadeService = require("./atividadeService");

const mapStatusToEnum = (status) => {
  const statusMap = {
    "Em Desenvolvimento": "EM_DESENVOLVIMENTO",
    "Em Produção": "EM_PRODUCAO",
    "Manutenção": "MANUTENCAO",
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
  ativo: dados.ativo !== undefined ? dados.ativo : true,
});

class SistemaService {
  async listarTodos() {
    const sistemas = await prisma.sistema.findMany({
      include: {
        _count: { select: { documentos: true } },
      },
      orderBy: { dataCriacao: "desc" },
    });

    return sistemas.map((sis) => ({
      ...sis,
      desenvolvedores: sis.desenvolvedores || [],
      empresasClientes: sis.empresasClientes || [],
      tecnologias: sis.tecnologias || [],
      totalDocumentos: sis._count.documentos,
    }));
  }

  // usuarioAtual precisa de { id } (vem de req.user no controller) — não só do nome,
  // porque a Atividade agora exige usuarioId (chave estrangeira real, não texto solto).
  async criar(dados, usuarioAtual) {
    const usuarioIdNum = usuarioAtual ? parseId(usuarioAtual.id, MSG.VALIDATION.INVALID_ID) : null;

    return prisma.$transaction(async (tx) => {
      const novoSistema = await tx.sistema.create({
        data: montarDadosSistema(dados),
      });

      if (usuarioIdNum) {
        await atividadeService.registrar(tx, {
          usuarioId: usuarioIdNum,
          acao: "criou o sistema",
          sistemaId: novoSistema.id,
        });
      }

      return novoSistema;
    });
  }

  async atualizar(id, dados, usuarioAtual) {
    const idNum = parseId(id, MSG.VALIDATION.INVALID_ID);
    const usuarioIdNum = usuarioAtual ? parseId(usuarioAtual.id, MSG.VALIDATION.INVALID_ID) : null;

    return prisma.$transaction(async (tx) => {
      const sistemaExiste = await tx.sistema.findUnique({ where: { id: idNum } });
      if (!sistemaExiste) throw new AppError(MSG.SISTEMA.NOT_FOUND, HTTP_STATUS.NOT_FOUND);

      const sistemaAtualizado = await tx.sistema.update({
        where: { id: idNum },
        data: montarDadosSistema(dados),
      });

      if (usuarioIdNum) {
        await atividadeService.registrar(tx, {
          usuarioId: usuarioIdNum,
          acao: "atualizou o sistema",
          sistemaId: sistemaAtualizado.id,
        });
      }

      return sistemaAtualizado;
    });
  }

  async apagar(id, usuarioAtual) {
    const idNum = parseId(id, MSG.VALIDATION.INVALID_ID);
    const usuarioIdNum = usuarioAtual ? parseId(usuarioAtual.id, MSG.VALIDATION.INVALID_ID) : null;

    return prisma.$transaction(async (tx) => {
      const sistemaExiste = await tx.sistema.findUnique({ where: { id: idNum } });
      if (!sistemaExiste) throw new AppError(MSG.SISTEMA.NOT_FOUND, HTTP_STATUS.NOT_FOUND);

      const sistemaApagado = await tx.sistema.delete({ where: { id: idNum } });

      if (usuarioIdNum) {
        // sistemaId fica de fora (o sistema já não existe depois deste delete) —
        // por isso o nome vai no próprio texto da ação, não numa relação.
        await atividadeService.registrar(tx, {
          usuarioId: usuarioIdNum,
          acao: `eliminou o sistema "${sistemaApagado.nome}"`,
        });
      }

      return sistemaApagado;
    });
  }

  async obterPorId(id) {
    const idNum = parseId(id, MSG.VALIDATION.INVALID_ID);

    const sistema = await prisma.sistema.findUnique({
      where: { id: idNum },
      include: { documentos: true },
    });

    if (!sistema) throw new AppError(MSG.SISTEMA.NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    return sistema;
  }
}

module.exports = new SistemaService();