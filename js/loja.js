// Variáveis globais
let dadosPublicos = [];
let diaSelecionado = "Todos";

// Função principal para carregar dados
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

    // Carrega dados da aba "Todas as Lojas"
    const response = await fetch(`${window.PLANILHA_URL}&sheet=${window.ABAS_PLANILHA.LOJAS}&t=${Date.now()}`);
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    
    const text = await response.text();
    const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\((.*)\);/);
    if (!jsonMatch) throw new Error("Formato de resposta inválido");
    
    const json = JSON.parse(jsonMatch[1]);
    if (!json?.table?.rows) throw new Error("Estrutura de dados incompleta");

    // Filtra os dados para mostrar apenas a loja atual (coluna 6 = Loja)
    const colunaLoja = 5; // Ajuste este índice conforme sua planilha
    dadosPublicos = json.table.rows
      .filter(row => row.c[colunaLoja]?.v === codigoLoja)
      .map(row => ({
        dataHora: row.c[0]?.f || row.c[0]?.v || "", // Coluna 1 = Data/Hora
        nome: row.c[1]?.v || "",                   // Coluna 2 = Nome
        marca: row.c[2]?.v || "",                  // Coluna 3 = Marca
        produto: row.c[3]?.v || "",                // Coluna 4 = Produto
        telefone: formatarTelefone(row.c[4]?.v),   // Coluna 5 = Telefone
        diaSemana: row.c[6]?.v || ""               // Coluna 7 = Dia da Semana
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

// Função para filtrar por dia
function filtrarDia(dia) {
  diaSelecionado = dia;
  filtrarDadosPublico();
}

// Função para filtrar dados
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

// Função para formatar telefone
function formatarTelefone(tel) {
  if (!tel) return "";
  const nums = tel.toString().replace(/\D/g, '');
  return nums.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

// Função para carregar dados locais
function carregarDadosLocais() {
  const urlParams = new URLSearchParams(window.location.search);
  const codigoLoja = urlParams.get('loja');
  const dadosLocais = localStorage.getItem(`dadosLoja_${codigoLoja}`);

  if (dadosLocais) {
    try {
      const { data, dados } = JSON.parse(dadosLocais);
      if (Date.now() - data < 3600000) { // 1 hora de cache
        dadosPublicos = dados;
        filtrarDadosPublico();
        document.getElementById("statusAtualiza").textContent =
          `⚠️ Dados locais (última atualização: ${new Date(data).toLocaleTimeString()})`;
      }
    } catch (e) {
      console.error("Erro ao carregar dados locais:", e);
    }
  }
}

// Inicialização
document.addEventListener("DOMContentLoaded", function() {
  // A configuração inicial é feita no HTML
});
