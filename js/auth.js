function login() {
  const usuarioInput = document.getElementById("usuario");
  const senhaInput = document.getElementById("senha");
  const erroElement = document.getElementById("erroLogin");

  const usuario = usuarioInput.value.trim();
  const senha = senhaInput.value.trim();

  if (!usuario) {
    mostrarErroLogin("Selecione uma loja", erroElement);
    return;
  }

  const logins = {
    gestor: { senha: "Ira95101", pagina: "gestor.html" },
    brasil: { senha: "001", pagina: "loja.html?loja=001" },
    parqueverde: { senha: "002", pagina: "loja.html?loja=002" },
    floresta: { senha: "003", pagina: "loja.html?loja=003" },
    tancredo: { senha: "004", pagina: "loja.html?loja=004" },
    gourmet: { senha: "005", pagina: "loja.html?loja=005" },
    porti1: { senha: "201", pagina: "loja.html?loja=201" },
    porti2: { senha: "202", pagina: "loja.html?loja=202" },
    porti3: { senha: "203", pagina: "loja.html?loja=203" },
    porti4: { senha: "204", pagina: "loja.html?loja=204" }
  };

  const loginConfig = logins[usuario];
  if (!loginConfig) {
    mostrarErroLogin("Loja não encontrada", erroElement);
    return;
  }

  if (loginConfig.senha !== senha) {
    mostrarErroLogin("Senha incorreta", erroElement);
    senhaInput.focus();
    senhaInput.select();
    return;
  }

  window.location.href = loginConfig.pagina;
}

function mostrarErroLogin(mensagem, erroElement) {
  erroElement.textContent = mensagem;
  erroElement.style.display = "block";
  setTimeout(() => erroElement.style.display = "none", 3000);
}

document.getElementById("senha").addEventListener("keypress", ({ key }) => {
  if (key === "Enter") login();
});

document.getElementById("usuario").addEventListener("change", function() {
  if (this.value) document.getElementById("senha").focus();
});
