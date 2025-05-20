let usuarioSelecionado = "";

function selecionarLoja(codigo) {
  usuarioSelecionado = codigo.toLowerCase();
  const senhaContainer = document.getElementById("senhaContainer");
  const erroLogin = document.getElementById("erroLogin");
  erroLogin.style.display = "none";

  if (usuarioSelecionado === "gestor") {
    // Mostrar o campo de senha só para gestor
    senhaContainer.style.display = "block";
    document.getElementById("senha").value = "";
    document.getElementById("senha").focus();
  } else {
    // Para lojas, ir direto para a página, sem senha
    senhaContainer.style.display = "none";

    // Redireciona para página da loja diretamente
    // Ajuste aqui para o link correto da loja, ex: loja.html?loja=001
    window.location.href = `loja.html?loja=${usuarioSelecionado}`;
  }
}

function login() {
  const senhaInput = document.getElementById("senha");
  const erroElement = document.getElementById("erroLogin");
  const senha = senhaInput.value.trim();

  if (usuarioSelecionado !== "gestor") {
    mostrarErroLogin("Selecione o painel do gestor para fazer login.", erroElement);
    return;
  }

  const senhaCorreta = "Ira95101"; // Senha do gestor

  if (senha !== senhaCorreta) {
    mostrarErroLogin("Senha incorreta.", erroElement);
    senhaInput.focus();
    senhaInput.select();
    return;
  }

  // Senha correta: redirecionar para painel do gestor
  window.location.href = "gestor.html";
}

function mostrarErroLogin(mensagem, erroElement) {
  erroElement.textContent = mensagem;
  erroElement.style.display = "block";
  setTimeout(() => {
    erroElement.style.display = "none";
  }, 3000);
}

// Permitir login ao apertar Enter no campo senha
document.getElementById("senha").addEventListener("keypress", function (e) {
  if (e.key === "Enter") login();
});
