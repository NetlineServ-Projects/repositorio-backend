function gerarNomeArquivo(originalname, ext) {
    const agora = new Date();

    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");
    const hora = String(agora.getHours()).padStart(2, "0");
    const minuto = String(agora.getMinutes()).padStart(2, "0");
    const segundo = String(agora.getSeconds()).padStart(2, "0");

    // sufixo aleatório curto para evitar colisão em uploads no mesmo segundo
    const sufixo = Math.floor(Math.random() * 1000);

    return `${ano}${mes}${dia}-${hora}${minuto}${segundo}-${sufixo}${ext}`;
}

module.exports = {
    gerarNomeArquivo
};