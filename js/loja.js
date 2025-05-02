let dadosPublicos = [];
let diaSelecionado = "Todos";

async function carregarDadosLoja() {
  const status = document.getElementById("statusAtualiza");
  status.textContent = "⏳ Carregando dados...";
  status.style.color = "#FFC107";

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const codigoLoja = urlParams.get('loja');
    
    if (!codigoLoja || !window.LOJAS[codigoLoja]) {
      throw new Error("Loja não configurada");
    }

    const response = await fetch(`${window.PLANILHA_URL}&sheet=${window.ABAS_PLANILHA.LOJAS}&t=${Date.now()}`);
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    
    const text = await response.text();
    const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\((.*)\);/);
    if (!jsonMatch) throw new Error("Formato de resposta inválido");
    
    const json = JSON.parse(jsonMatch[1]);
    if (!json?.table?.rows) throw new Error("Estrutura de dados incompleta");

    // Filtra os dados para mostrar apenas a loja atual
    const colunaLoja = 5; // Ajuste conforme a posição da coluna "Loja" na planilha
    dadosPublicos = json.table.rows
      .filter(row => row.c[colunaLoja]?.v === codigoLoja)
      .map(row => ({
        dataHora: row.c[0]?.f || row.c[0]?.v || "",
        nome: row.c[1]?.v || "",
        marca: row.c[2]?.v || "",
        produto: row.c[3]?.v || "",
        telefone: formatarTelefone(row.c[4]?.v),
        diaSemana: row.c[6]?.v || ""
      }));

    localStorage.setItem(`dadosLoja_${codigoLoja}`, JSON.stringify({
      data: Date.now(),
      dados: dadosPublicos
    }));

    filtrarDadosPublico();
    status.textContent = "✅ Dados carregados!";
    status.style.color = "#00C853";
    setTimeout(() => status.textContent = "", 2000);

  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    status.textContent = `❌ Erro: ${error.message}`;
    status.style.color = "#EF5350";
    carregarDadosLocais();
  }
}

function filtrarDadosPublico() {
  const termo = document.getElementById("buscaPublica").value.toLowerCase();
  const tabela = document.querySelector("#tabelaPublica tbody");

  const filtrados = dadosPublicos.filter(item => {
    const condDia = diaSelecionado === "Todos" || item.diaSemana === diaSelecionado;
    const condTexto =
      item.nome.toLowerCase().includes(termo) ||
      item.marca.toLowerCase().includes(termo) ||
      item.produto.toLowerCase().includes(termo) ||
      item.telefone.toLowerCase().includes(termo);
    return condDia && condTexto;
  });

  tabela.innerHTML = filtrados.map(item => `
    <tr>
      <td>${item.dataHora}</td>
      <td>${item.nome}</td>
      <td>${item.marca}</td>
      <td>${item.produto}</td>
      <td>${item.telefone}</td>
    </tr>
  `).join("");
}

// ... (mantenha as outras funções como formatarTelefone, carregarDadosLocais, etc.)

// Atualize o event listener para usar a nova função

function formatarTelefone(telefone) {
  const nums = telefone.replace(/\D/g, '');
  if (nums.length < 11) return telefone; // Se não tiver 11 dígitos, retorna original
  return nums.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

// Função adaptada para aceitar dados passados ou buscar padrão
function filtrarDadosPublico(dados = null) {
  if (!dados) {
    console.warn("Nenhum dado fornecido para filtro. A função deve buscar no cache ou lidar com fallback.");
    return;
  }

  // Exemplo de tratamento dos dados — adapte conforme seu frontend espera
  console.log("Dados filtrados:", dados);
}
document.addEventListener("DOMContentLoaded", carregarDadosLoja);
