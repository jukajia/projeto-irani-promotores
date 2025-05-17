document.addEventListener("DOMContentLoaded", function () {
  const botoes = document.querySelectorAll(".loja-button");
  const senhaInput = document.getElementById("senha");
  const loginButton = document.querySelector(".login-button");
  const erroMsg = document.querySelector(".erro-msg");

  let lojaSelecionada = null;

  // Ativar botão e campo de senha somente se "Gestor" for selecionado
  botoes.forEach((botao) => {
    botao.addEventListener("click", function () {
      botoes.forEach((b) => b.classList.remove("selected"));
      this.classList.add("selected");
      lojaSelecionada = this.dataset.loja;

      // Mostrar ou ocultar campo de senha
      if (lojaSelecionada === "Gestor") {
        document.querySelector(".senha-container").style.display = "block";
        senhaInput.value = "";
      } else {
        document.querySelector(".senha-container").style.display = "none";
        senhaInput.value = ""; // limpar se trocado
      }
    });
  });

  loginButton.addEventListener("click", function () {
    if (!lojaSelecionada) {
      mostrarErro("Selecione uma loja.");
      return;
    }

    // Se for gestor, exige senha
    if (lojaSelecionada === "Gestor") {
      const senha = senhaInput.value.trim();
      if (senha === "Ira95101") {
        window.location.href = "gestor.html";
      } else {
        mostrarErro("Senha incorreta.");
      }
    } else {
      // Caso contrário, redireciona direto
      window.location.href = `loja.html?loja=${encodeURIComponent(lojaSelecionada)}`;
    }
  });

  function mostrarErro(mensagem) {
    erroMsg.textContent = mensagem;
    erroMsg.style.display = "block";
    setTimeout(() => {
      erroMsg.style.display = "none";
    }, 3000);
  }
});
