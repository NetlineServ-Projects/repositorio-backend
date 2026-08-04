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

// Converte para número e valida — lança erro se não for um ID válido
function parseId(valor, mensagemErro) {
    const idNum = Number(valor);
    if (isNaN(idNum)) {
        throw new Error(mensagemErro);
    }
    return idNum;
}

// Converte o campo "tamanho" (BigInt) para String, para não quebrar o JSON.stringify
function formatarDocumento(documento) {
    return {
        ...documento,
        tamanho: documento.tamanho ? documento.tamanho.toString() : "0",
    };
}

// Remove a senha antes de devolver o usuário ao cliente
function formatarUsuario(usuario) {
    const { senha, ...usuarioSemSenha } = usuario;
    return usuarioSemSenha;
}




module.exports = {
    gerarNomeArquivo,
     parseId,
    formatarDocumento,
    formatarUsuario
};