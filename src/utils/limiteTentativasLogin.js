// Trava a adivinhação de palavras-passe: depois de MAX_FALHAS tentativas falhadas para o
// mesmo e-mail dentro da JANELA, esse e-mail fica bloqueado durante BLOQUEIO.
// Fica em memória: chega para uma única instância da API (reinicia com o servidor).

const MAX_FALHAS = 5;
const JANELA_MS = 15 * 60 * 1000;
const BLOQUEIO_MS = 15 * 60 * 1000;

const tentativas = new Map(); // email -> { falhas, primeiraFalha, bloqueadoAte }

const chave = (email) => String(email ?? "").trim().toLowerCase();

// Devolve os segundos que faltam se o e-mail estiver bloqueado; 0 se puder tentar
function segundosDeBloqueio(email) {
  const registo = tentativas.get(chave(email));
  if (!registo?.bloqueadoAte) return 0;
  const restante = registo.bloqueadoAte - Date.now();
  if (restante <= 0) {
    tentativas.delete(chave(email));
    return 0;
  }
  return Math.ceil(restante / 1000);
}

function registarFalha(email) {
  const k = chave(email);
  const agora = Date.now();
  const registo = tentativas.get(k);

  // Falhas antigas (fora da janela) não contam
  if (!registo || agora - registo.primeiraFalha > JANELA_MS) {
    tentativas.set(k, { falhas: 1, primeiraFalha: agora, bloqueadoAte: null });
    return;
  }

  registo.falhas += 1;
  if (registo.falhas >= MAX_FALHAS) registo.bloqueadoAte = agora + BLOQUEIO_MS;
}

function limpar(email) {
  tentativas.delete(chave(email));
}

// Limpeza periódica, para o mapa não crescer com e-mails que nunca voltam
setInterval(() => {
  const agora = Date.now();
  for (const [k, r] of tentativas) {
    const expirou = r.bloqueadoAte ? r.bloqueadoAte < agora : agora - r.primeiraFalha > JANELA_MS;
    if (expirou) tentativas.delete(k);
  }
}, JANELA_MS).unref();

module.exports = { segundosDeBloqueio, registarFalha, limpar, MAX_FALHAS };
