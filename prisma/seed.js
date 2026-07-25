const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {

    const categorias = [
        {
            nome: "Recursos Humanos",
            descricao: "Contratos de trabalho, Avaliações de desempenho, Regulamentos internos, Folhas de férias , Processos de colaboradores. "
        },
        {
            nome: "Financeiro",
            descricao: "Facturas, Recibos, Notas de débito, Notas de crédito, Comprovativos de pagamento, Orçamentos."
        },
        {
            nome: "INSS",
            descricao: "Declarações,  guias de pagamento, Comprovativos de contribuição, correspondência do INSS"
        },
        {
            nome: "Contratos",
            descricao: "Contratos com clientes, fornecedores,Prestações de serviços e parceiros"
        },
        {
            nome: "Actas",
            descricao: "Atas de reuniões, assembleias e reuniões de equipa"
        },
        {
            nome: "Políticas e Procedimentos",
            descricao: "Normas internas, Políticas de segurança, Processos da empresa "
        },
        {
            nome: "Manuais",
            descricao: "Manuais e Guias de Utilização, Equipamentos e Procedimentos"
        },
        {
            nome: "Relatórios",
            descricao: "Relatórios financeiros,técnicos, operacionais e de auditoria"
        },
        {
            nome: "Projectos",
            descricao: "Documentação de projectos, Cronogramas , Requisitos e Datas de entrega"
        },
         {
            nome: "Documentação Técnica ",
            descricao: "Diagramas,Especificações técnicas,APIs, Arquitectura de Sistemas "
        },
        {
            nome: "Formulários e Modelos",
            descricao: "Templates, Requerimentos, Formulários e Minutas"
        },
        {
            nome: "Treinamentos",
            descricao: "Materias de formação, Apresentação e certificados  "
        },
         {
            nome: "Autoridade Tributária",
            descricao: " IVA,IRPS,IRPC, declarações fiscais, comprovativos de pagamentos de impostos "
        },
         {
            nome: "Jurídico",
            descricao: "Pareceres jurídicos, procurações, licenças de documentos legais"
        }







    ];

    for (const categoria of categorias) {

        await prisma.categoria.upsert({
            where: {
                nome: categoria.nome
            },
            update: {},
            create: categoria
        });

    }

    console.log("Categorias inseridas com sucesso.");
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });