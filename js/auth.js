<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login | Supermercado Irani</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="icon" href="imagens/favicon-juka.png" type="image/png">
  <script src="js/auth.js" defer></script>
</head>
<body class="login-body">
  <div class="login-container">
    <img src="imagens/logo-irani.png" alt="Logo Irani" class="login-logo">
    <h1>Área de Acesso</h1>

    <label for="usuario">Selecione sua loja:</label>
    <select id="usuario">
      <option value="">-- Escolha a Loja --</option>
      <option value="gestor">Gestor</option>
      <option value="brasil">Brasil (001)</option>
      <option value="parqueverde">Parque Verde (002)</option>
      <option value="floresta">Floresta (003)</option>
      <option value="tancredo">Tancredo (004)</option>
      <option value="gourmet">Gourmet (005)</option>
      <option value="porti1">Portí 1 (201)</option>
      <option value="porti2">Portí 2 (202)</option>
      <option value="porti3">Portí 3 (203)</option>
      <option value="porti4">Portí 4 (204)</option>
    </select>

    <label for="senha">Senha:</label>
    <input type="password" id="senha" placeholder="Digite sua senha">

    <button onclick="login()">Entrar</button>
    <div id="erroLogin" class="erro-msg" style="display:none;"></div>
  </div>
</body>
</html>

<!-- auth.js -->
<script>
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
</script>
