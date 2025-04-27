function login() {
    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;
    const erro = document.getElementById("erroLogin");
  
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
  
    const loginValido = logins[usuario] && logins[usuario].senha === senha;
  
    if (loginValido) {
      window.location.href = logins[usuario].pagina;
    } else {
      erro.style.display = "block";
      setTimeout(() => erro.style.display = "none", 3000);
    }
  }
  
  // Permitir login com Enter
  document.getElementById("senha").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      login();
    }
  });