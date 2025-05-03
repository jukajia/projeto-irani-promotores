function login() {
  const loja = document.getElementById('lojaSelect').value;
  const senha = document.getElementById('senha').value.trim();

  // Acesso total (Gestor)
  if (senha === "Ira95101") {
    localStorage.setItem("auth", JSON.stringify({ tipo: "gestor" }));
    window.location.href = "gestor.html";
    return;
  }

  // Lojas com senha rápida ou sem senha
  const lojasPermitidas = ["001", "002", "003", "004", "005", "201", "202", "203", "204"];
  
  if (lojasPermitidas.includes(loja)) {
    // Senha opcional para lojas
    if (senha === "" || senha === loja) {
      localStorage.setItem("auth", JSON.stringify({ tipo: "loja", loja: loja }));
      window.location.href = "loja.html";
      return;
    } else {
      alert("Senha incorreta para esta loja!");
    }
  } else {
    alert("Selecione uma loja válida.");
  }
}

