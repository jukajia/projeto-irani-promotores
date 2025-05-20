let usuarioSelecionado = "";

function selecionarLoja(codigo) {
  usuarioSelecionado = codigo.toLowerCase();
  const senhaContainer = document.getElementById("senhaContainer");
  const erroLogin = document.getElementById("erroLogin");
  erroLogin.style.display = "none";

  if (usuarioSelecionado === "gestor") {
    senhaContainer.style.display = "block";
    document.getElementById("senha").focus();
  } else {
    senhaContainer.style.display = "none";
    // Redireciona direto para a página da loja, sem senha
    const paginas = {
      "001": "loja.html?loja=001",
      "002": "loja.html?loja=002",
      "003": "loja.html?loja=003",
      "004": "loja.html?loja=004",
      "005": "loja.html?loja=005",
      "201": "loja.html?loja=201",
      "202": "loja.html?loja=202",
      "203": "loja.html?loja=203",
      "204": "loja.html?loja=204"
    };
    const pagina = paginas[usuarioSelecionado];
    if (pagina) {
      window.location.href = pagina;
    } else {
      alert("Loja não configurada para acesso direto.");
    }
  }
}

function login() {
  const senhaInput = document.getElementById("senha");
  const erroElement = document.getElementById("erroLogin");
  const senha = senhaInput.value.trim();

  if (!usuarioSelecionado) {
    mostrarErroLogin("Selecione uma loja ou o painel do gestor.", erroElement);
    return;
  }

  const logins = {
    gestor: { senha: "Ira95101", pagina: "gestor.html" }
  };

  const loginInfo = logins[usuarioSelecionado];
  if (!loginInfo) {
    mostrarErroLogin("Usuário inválido para login com senha.", erroElement);
    return;
  }

  if (senha !== loginInfo.senha) {
    mostrarErroLogin("Senha incorreta.", erroElement);
    senhaInput.focus();
    senhaInput.select();
    return;
  }

  window.location.href = loginInfo.pagina;
}

function mostrarErroLogin(mensagem, erroElement) {
  erroElement.textContent = mensagem;
  erroElement.style.display = "block";
  setTimeout(() => {
    erroElement.style.display = "none";
  }, 3000);
}

document.getElementById("senha").addEventListener("keypress", function (e) {
  if (e.key === "Enter") login();
});
