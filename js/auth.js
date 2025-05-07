let lojaSelecionada = null;

function selecionarLoja(codigoLoja) {
  lojaSelecionada = codigoLoja;
  const senhaContainer = document.getElementById("senhaContainer");
  const erroElement = document.getElementById("erroLogin");
  
  // Resetar estado
  document.querySelectorAll('.loja-button').forEach(btn => {
    btn.classList.remove('selected');
  });
  document.getElementById("senha").value = "";
  erroElement.style.display = "none";
  
  // Adicionar classe selected ao botão clicado
  event.currentTarget.classList.add('selected');
  
  // Mostrar campo de senha apenas para gestor
  if (codigoLoja === 'gestor') {
    senhaContainer.style.display = "block";
  } else {
    senhaContainer.style.display = "none";
    acessarLoja(codigoLoja);
  }
}

function login() {
  const senhaInput = document.getElementById("senha");
  const erroElement = document.getElementById("erroLogin");
  const senha = senhaInput.value.trim();

  if (!senha) {
    mostrarErroLogin("Digite a senha do gestor", erroElement);
    return;
  }

  // Senha do gestor (pode ser alterada conforme necessidade)
  const SENHA_GESTOR = "Ira95101";

  if (senha === SENHA_GESTOR) {
    window.location.href = "gestor.html";
  } else {
    mostrarErroLogin("Senha incorreta", erroElement);
    senhaInput.focus();
    senhaInput.select();
  }
}

function acessarLoja(codigoLoja) {
  window.location.href = `loja.html?loja=${codigoLoja}`;
}

function mostrarErroLogin(mensagem, erroElement) {
  erroElement.textContent = mensagem;
  erroElement.style.display = "block";
  setTimeout(() => erroElement.style.display = "none", 3000);
}

document.getElementById("senha").addEventListener("keypress", ({ key }) => {
  if (key === "Enter") login();
});
