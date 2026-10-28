// Cookie da sessão: guarda o JWT fora do alcance do JavaScript da página.
//   - httpOnly: nenhum script (nem um injetado por XSS) o consegue ler;
//   - secure: só viaja por HTTPS (o Chrome aceita-o também em http://localhost);
//   - sameSite "strict": não é enviado em pedidos vindos de outros sites (proteção contra CSRF).
// O frontend e a API têm de estar no mesmo site (ex: app.netline.co.mz e api.netline.co.mz).

const NOME_COOKIE_SESSAO = "netline_sessao";
const DURACAO_SESSAO_MS = 24 * 60 * 60 * 1000; // igual ao expiresIn "1d" do JWT

// COOKIE_SECURE=false só para um servidor de testes sem HTTPS
const usarSecure = () => process.env.COOKIE_SECURE !== "false";

function opcoesCookie() {
  return {
    httpOnly: true,
    secure: usarSecure(),
    sameSite: "strict",
    path: "/",
  };
}

function definirCookieSessao(res, token) {
  res.cookie(NOME_COOKIE_SESSAO, token, { ...opcoesCookie(), maxAge: DURACAO_SESSAO_MS });
}

function limparCookieSessao(res) {
  res.clearCookie(NOME_COOKIE_SESSAO, opcoesCookie());
}

module.exports = { NOME_COOKIE_SESSAO, definirCookieSessao, limparCookieSessao };
