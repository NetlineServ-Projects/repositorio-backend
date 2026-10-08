/**
 * fileHelper.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Funções utilitárias partilhadas por controllers e services.
 * Centraliza aqui toda a lógica auxiliar "cumpida" para manter os services
 * e controllers concisos e focados na lógica de negócio.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const path = require("path");

// ─── UTILIZADORES ────────────────────────────────────────────────────────────

/**
 * Remove campos internos antes de devolver o utilizador ao cliente.
 * Garante que a senha nunca sai da API.
 */
function formatarUsuario(usuario) {
    const { senha, ...usuarioSemSenha } = usuario;
    return usuarioSemSenha;
}

/**
 * Constrói a URL pública de uma fotografia a partir do nome do ficheiro
 * (ex: "20260827-123957-98.jpg" → "/uploads/avatars/20260827-123957-98.jpg").
 */
function construirUrlFotografia(nomeArquivo) {
    return `/uploads/avatars/${nomeArquivo}`;
}

// ─── DOCUMENTOS ──────────────────────────────────────────────────────────────

/**
 * Converte o campo "tamanho" (BigInt) para String para não quebrar o JSON.stringify.
 * O JSON nativo não serializa BigInt — sem este helper a resposta lança um TypeError.
 */
function formatarDocumento(documento) {
    return {
        ...documento,
        tamanho: documento.tamanho != null ? documento.tamanho.toString() : "0",
    };
}

// ─── FICHEIROS / UPLOADS ─────────────────────────────────────────────────────

/**
 * Gera um nome de ficheiro único baseado em data/hora + sufixo aleatório.
 * Evita colisões mesmo em uploads no mesmo segundo.
 * Ex: "20261008-112500-437.pdf"
 */
function gerarNomeArquivo(originalname, ext) {
    const agora = new Date();

    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");
    const hora = String(agora.getHours()).padStart(2, "0");
    const minuto = String(agora.getMinutes()).padStart(2, "0");
    const segundo = String(agora.getSeconds()).padStart(2, "0");

    const sufixo = Math.floor(Math.random() * 1000);

    return `${ano}${mes}${dia}-${hora}${minuto}${segundo}-${sufixo}${ext}`;
}

/**
 * Apaga um ficheiro de upload em background (sem bloquear a resposta).
 * Ignora o erro silenciosamente — se o ficheiro já não existir, não é problema.
 * Usa um caminho relativo à raiz do projecto (uploads/avatars/...).
 */
function apagarFicheiroAntigoPerfil(urlFotografiaAntiga) {
    if (!urlFotografiaAntiga) return;

    const fs = require("fs/promises");
    const caminhoAntigo = path.join(
        "uploads/avatars",
        path.basename(urlFotografiaAntiga)
    );

    fs.unlink(caminhoAntigo).catch((err) => {
        // Regista para diagnóstico mas não bloqueia o fluxo
        console.warn(`[fileHelper] Não foi possível apagar ficheiro antigo: ${caminhoAntigo}`, err.code);
    });
}

// ─── IDs ─────────────────────────────────────────────────────────────────────

/**
 * Converte um valor para número inteiro e lança AppError se for inválido.
 * Usado em services onde o id vem como string (ex: req.params.id).
 */
function parseId(valor, mensagemErro) {
    const idNum = Number(valor);
    if (!Number.isInteger(idNum) || idNum <= 0) {
        const AppError = require("./AppError");
        const HTTP = require("./httpsStatus");
        throw new AppError(mensagemErro, HTTP.BAD_REQUEST);
    }
    return idNum;
}

// ─── DADOS PARCIAIS (PATCH) ──────────────────────────────────────────────────

/**
 * Constrói um objecto de actualização com apenas os campos presentes no body.
 * Útil para operações PATCH: só os campos enviados são actualizados.
 *
 * @param {string[]} camposPermitidos - Lista de campos aceites.
 * @param {object}   dados           - Objecto com os dados do body (já validado pelo Zod).
 * @returns {object} Subconjunto dos dados, com apenas os campos permitidos e definidos.
 */
function construirDadosParciais(camposPermitidos, dados) {
    const resultado = {};
    for (const campo of camposPermitidos) {
        if (dados[campo] !== undefined) {
            resultado[campo] = dados[campo];
        }
    }
    return resultado;
}

// ─── AMBIENTE / CONFIG ───────────────────────────────────────────────────────

/**
 * Valida que todas as variáveis de ambiente obrigatórias estão definidas.
 * Deve ser chamado no arranque da aplicação — falha rápido antes de receber pedidos.
 *
 * @param {string[]} variaveis - Nomes das variáveis obrigatórias.
 * @throws {Error} Se alguma variável estiver em falta.
 */
function validarEnvVars(variaveis) {
    const emFalta = variaveis.filter((v) => !process.env[v]);
    if (emFalta.length > 0) {
        throw new Error(
            `Variáveis de ambiente obrigatórias não definidas: ${emFalta.join(", ")}`
        );
    }
}

// ─── RÓTULOS ─────────────────────────────────────────────────────────────────

/**
 * Mapeia o valor do enum TipoAmbiente para um rótulo legível em português.
 * Usado nas mensagens de auditoria (Atividade).
 */
const ROTULO_AMBIENTE = {
    PRODUCAO:       "Produção",
    TESTES:         "Testes",
    DESENVOLVIMENTO: "Desenvolvimento",
};

function rotuloAmbiente(ambiente) {
    return ROTULO_AMBIENTE[ambiente] ?? ambiente;
}

/**
 * Mapeia o valor do enum TipoPlataforma para um rótulo legível em português.
 */
const ROTULO_TIPO_PLATAFORMA = {
    CLOUD_BASE_DADOS: "Cloud/Base de dados",
    CONTAINERIZACAO:  "Containerização",
    GESTAO_DOMINIO:   "Gestão de domínio",
};

function rotuloTipoPlataforma(tipo) {
    return ROTULO_TIPO_PLATAFORMA[tipo] ?? tipo;
}

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

module.exports = {
    // Utilizadores
    formatarUsuario,
    construirUrlFotografia,

    // Documentos
    formatarDocumento,

    // Ficheiros
    gerarNomeArquivo,
    apagarFicheiroAntigoPerfil,

    // IDs
    parseId,

    // Dados parciais
    construirDadosParciais,

    // Config
    validarEnvVars,

    // Rótulos
    rotuloAmbiente,
    rotuloTipoPlataforma,
};