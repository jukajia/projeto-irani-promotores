function login() {
  const usuario = document.getElementById("usuario").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const erroElement = document.getElementById("erroLogin");
  
  // Validações iniciais
  if (!usuario) {
    showError("Selecione uma loja válida");
    return;
  }

  if (!senha) {
    showError("Digite a senha");
    document.getElementById("senha").focus();
    return;
  }

  // Lista de logins (em um ambiente real, isso viria de um backend)
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

  // Verifica credenciais
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

  // Redirecionamento seguro
  try {
    window.location.href = loginConfig.pagina;
  } catch (error) {
    showError("Erro ao redirecionar");
    console.error("Redirecionamento falhou:", error);
  }
}

// Função auxiliar para mostrar erros
function showError(mensagem) {
  const erroElement = document.getElementById("erroLogin");
  erroElement.textContent = mensagem;
  erroElement.style.display = "block";
  
  setTimeout(() => {
    erroElement.style.display = "none";
  }, 3000);
}

// Event listeners melhorados
document.getElementById("senha").addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault(); // Evita comportamento padrão do formulário
    login();
  }
});

// Foco automático no campo de senha quando loja é selecionada
document.getElementById("usuario").addEventListener("change", function() {
  if (this.value) {
    document.getElementById("senha").focus();
  }
});
