/**
 * SISTEMA DE AUTENTICAÇÃO - SUPERMERCADO IRANI
 * 
 * Gerencia o login de usuários (gestor e lojas) com:
 * - Validação de credenciais
 * - Tratamento de erros
 * - Redirecionamento seguro
 */

// Configuração centralizada de logins
const LOGIN_CONFIG = {
  gestor: {
    senha: "Ira95101",
    pagina: "gestor.html",
    nome: "Gestor"
  },
  lojas: {
    '001': { senha: "001", nome: "Brasil" },
    '002': { senha: "002", nome: "Parque Verde" },
    '003': { senha: "003", nome: "Floresta" },
    '004': { senha: "004", nome: "Tancredo" },
    '005': { senha: "005", nome: "Gourmet" },
    '201': { senha: "201", nome: "Portí 1" },
    '202': { senha: "202", nome: "Portí 2" },
    '203': { senha: "203", nome: "Portí 3" },
    '204': { senha: "204", nome: "Portí 4" }
  }
};

// Tempo de exibição de mensagens de erro (ms)
const ERRO_TIMEOUT = 3000;

function login() {
  // Elementos da interface
  const usuarioInput = document.getElementById("usuario");
  const senhaInput = document.getElementById("senha");
  const erroElement = document.getElementById("erroLogin");
  
  // Obter e sanitizar valores
  const usuario = usuarioInput.value.trim().toLowerCase();
  const senha = senhaInput.value.trim();

  // Validações iniciais
  if (!usuario) {
    mostrarErro("Selecione uma loja", erroElement);
    usuarioInput.focus();
    return;
  }

  try {
    // Verificar credenciais
    const credenciais = validarCredenciais(usuario, senha);
    
    // Redirecionar se as credenciais estiverem corretas
    redirecionarUsuario(credenciais.pagina);
    
  } catch (error) {
    // Tratamento de erros
    tratarErroLogin(error, erroElement, senhaInput);
  }
}

function validarCredenciais(usuario, senha) {
  // Verificar se é login do gestor
  if (usuario === "gestor") {
    if (senha === LOGIN_CONFIG.gestor.senha) {
      return {
        pagina: LOGIN_CONFIG.gestor.pagina,
        nome: LOGIN_CONFIG.gestor.nome
      };
    }
    throw new Error("Senha incorreta");
  }

  // Verificar logins das lojas
  const codigoLoja = Object.keys(LOGIN_CONFIG.lojas).find(
    codigo => usuario === LOGIN_CONFIG.lojas[codigo].nome.toLowerCase().replace(/\s+/g, '')
  );

  if (!codigoLoja) {
    throw new Error("Loja não encontrada");
  }

  if (senha !== LOGIN_CONFIG.lojas[codigoLoja].senha) {
    throw new Error("Senha incorreta");
  }

  return {
    pagina: `loja.html?loja=${codigoLoja}`,
    nome: LOGIN_CONFIG.lojas[codigoLoja].nome
  };
}

function redirecionarUsuario(pagina) {
  // Adicionar parâmetros adicionais se necessário
  const url = new URL(pagina, window.location.origin);
  
  // Armazenar timestamp do login
  sessionStorage.setItem('ultimoLogin', Date.now());
  
  window.location.href = url.toString();
}

function tratarErroLogin(error, erroElement, senhaInput) {
  console.error("Erro no login:", error.message);
  
  switch (error.message) {
    case "Senha incorreta":
      mostrarErro("Senha incorreta", erroElement);
      senhaInput.focus();
      senhaInput.select();
      break;
      
    case "Loja não encontrada":
      mostrarErro("Loja não encontrada", erroElement);
      break;
      
    default:
      mostrarErro("Erro durante o login", erroElement);
  }
}

function mostrarErro(mensagem, elemento) {
  elemento.textContent = mensagem;
  elemento.style.display = "block";
  
  setTimeout(() => {
    elemento.style.display = "none";
  }, ERRO_TIMEOUT);
}

// Event Listeners
document.getElementById("senha").addEventListener("keypress", (e) => {
  if (e.key === "Enter") login();
});

document.getElementById("usuario").addEventListener("change", function() {
  if (this.value) {
    document.getElementById("senha").focus();
  }
});
