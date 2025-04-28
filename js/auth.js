function login() {
  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;
  const erroElement = document.getElementById("erroLogin");

  if (!usuario) {
    showError("Selecione uma loja");
    return;
  }

  const logins = {
    gestor:   { senha: "Ira95101", pagina: "gestor.html" },
    brasil:   { senha: "001",      pagina: "loja.html?loja=001" },
    parqueverde: { senha: "002",   pagina: "loja.html?loja=002" },
    floresta: { senha: "003",      pagina: "loja.html?loja=003" },
    tancredo: { senha: "004",      pagina: "loja.html?loja=004" },
    gourmet:  { senha: "005",      pagina: "loja.html?loja=005" },
    porti1:   { senha: "201",      pagina: "loja.html?loja=201" },
    porti2:   { senha: "202",      pagina: "loja.html?loja=202" },
    porti3:   { senha: "203",      pagina: "loja.html?loja=203" },
    porti4:   { senha: "204",      pagina: "loja.html?loja=204" }
  };

  const loginConfig = logins[usuario];
  if (!loginConfig) {
    showError("Loja não encontrada");
    return;
  }

  if (loginConfig.senha !== senha) {
    showError("Senha incorreta");
    document.getElementById("senha").select();
    return;
  }

  window.location.href = loginConfig.pagina;
}

function showError(mensagem) {
  const erro = document.getElementById("erroLogin");
  erro.textContent = mensagem;
  erro.style.display = "block";
  setTimeout(() => erro.style.display = "none", 3000);
}

document.getElementById("senha").addEventListener("keypress", e => {
  if (e.key === "Enter") login();
});
document.getElementById("usuario").addEventListener("change", function() {
  if (this.value) document.getElementById("senha").focus();
});
