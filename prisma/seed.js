const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {

    const categorias = [
        {
            nome: "Recursos Humanos",
            descricao: "Contratos de trabalho, Avaliações de desempenho, Regulamentos internos, Folhas de férias , Processos de colaboradores. ",
            sensivel: true
        },
        {
            nome: "Financeiro",
            descricao: "Facturas, Recibos, Notas de débito, Notas de crédito, Comprovativos de pagamento, Orçamentos.",
            sensivel:true
        },
        {
            nome: "INSS",
            descricao: "Declarações,  guias de pagamento, Comprovativos de contribuição, correspondência do INSS",
            sensivel :true
        },
        {
            nome: "Contratos",
            descricao: "Contratos com clientes, fornecedores,Prestações de serviços e parceiros",
           sensivel:true
        },
        {
            nome: "Actas",
            descricao: "Atas de reuniões, assembleias e reuniões de equipa",
            sensivel: false        
        },
        {
            nome: "Políticas e Procedimentos",
            descricao: "Normas internas, Políticas de segurança, Processos da empresa ",
            sensivel : false
        },
        {
            nome: "Manuais",
            descricao: "Manuais e Guias de Utilização, Equipamentos e Procedimentos",
             sensivel: false
        },
        {
            nome: "Relatórios",
            descricao: "Relatórios financeiros,técnicos, operacionais e de auditoria",
             sensivel: true
        },
        {
            nome: "Projectos",
            descricao: "Documentação de projectos, Cronogramas , Requisitos e Datas de entrega",
            sensivel:false
        },
         {
            nome: "Documentação Técnica ",
            descricao: "Diagramas,Especificações técnicas,APIs, Arquitectura de Sistemas ",
            sensivel: false
        },
        {
            nome: "Formulários e Modelos",
            descricao: "Templates, Requerimentos, Formulários e Minutas",
            sensivel: false
        },
        {
            nome: "Treinamentos",
            descricao: "Materias de formação, Apresentação e certificados  ",
            sensivel: false
        },
         {
            nome: "Autoridade Tributária",
            descricao: " IVA,IRPS,IRPC, declarações fiscais, comprovativos de pagamentos de impostos ",
            sensivel: true
        },
         {
            nome: "Jurídico",
            descricao: "Pareceres jurídicos, procurações, licenças de documentos legais",
            sensivel: true
        }







    ];

    for (const categoria of categorias) {

        await prisma.categoria.upsert({
            where: {
                nome: categoria.nome
            },
            update: {
                sensivel: categoria.sensivel
            },
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