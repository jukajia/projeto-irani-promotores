function login() {
  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;
  const erroElement = document.getElementById("erroLogin");

  // Validações
  if (!usuario) {
    showError("Selecione uma loja");
    return;
  }

  const logins = {
    gestor: { senha: "Ira95101", pagina: "gestor.html" },
    brasil: { senha: "001", pagina: "loja.html?loja=001" },
    parqueverde: { senha: "002", pagina: "loja.html?loja=002" },
    // ... mantenha todos os outros logins
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

  // Redirecionamento seguro
  window.location.href = loginConfig.pagina;
}

function showError(mensagem) {
  const erro = document.getElementById("erroLogin");
  erro.textContent = mensagem;
  erro.style.display = "block";
  setTimeout(() => erro.style.display = "none", 3000);
}

// Event listeners
document.getElementById("senha").addEventListener("keypress", (e) => {
  if (e.key === "Enter") login();
});

document.getElementById("usuario").addEventListener("change", function() {
  if (this.value) {
    document.getElementById("senha").focus();
  }
});
