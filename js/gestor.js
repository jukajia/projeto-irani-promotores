// js/gestor.js

// Usa a URL definida em config.js
const PLANILHA_URL = window.PLANILHA_URL;

let dadosGestor = [];
let cabecalhos = [];
let lojaAtual = "Todos";
let chartLoja, chartDia, chartPromotor;

// Carrega e processa a planilha
async function atualizarPlanilha() {
  const status = document.getElementById("statusAtualiza");
  status.textContent = "⏳ Carregando…";

  try {
    if (!PLANILHA_URL) throw new Error("URL da planilha não configurada");
    const res = await fetch(`${PLANILHA_URL}&t=${Date.now()}`);
    if (!res.ok) throw new Error(`Erro HTTP: ${res.status} ${res.statusText}`);

    const text = await res.text();
    // Regex que captura até o ); (incluindo quebras de linha)
    const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*?)\);/);
    if (!match) throw new Error("Formato de resposta inválido");

    const json = JSON.parse(match[1]);
    if (!json.table || !json.table.cols || !json.table.rows)
      throw new Error("Estrutura de dados incompleta");

    // Extrai cabeçalhos e dados
    cabecalhos = json.table.cols.map(c => c.label);
    dadosGestor = json.table.rows.map(r => r.c.map(cell => cell?.f ?? cell?.v ?? ""));

    // Salva no localStorage
    localStorage.setItem("dadosGestor", JSON.stringify({
      data: Date.now(),
      cabecalhos,
      dados: dadosGestor
    }));

    // Renderiza tudo
    renderCabecalho();
    renderTabela(dadosGestor);
    gerarGraficos(dadosGestor);
    gerarRanking(dadosGestor);

    status.textContent = "✅ Atualizado!";
    setTimeout(() => status.textContent = "", 2000);

  } catch (error) {
    console.error("Erro ao carregar planilha:", error);
    status.textContent = `❌ Erro: ${error.message}`;
    usarDadosLocais();
  }
}

// Fallback para dados em localStorage
function usarDadosLocais() {
  const raw = localStorage.getItem("dadosGestor");
  if (!raw) return;

  try {
    const { data, cabecalhos: h, dados } = JSON.parse(raw);
    cabecalhos = h;
    dadosGestor = dados;

    renderCabecalho();
    renderTabela(dadosGestor);
    gerarGraficos(dadosGestor);
    gerarRanking(dadosGestor);

    document.getElementById("statusAtualiza").textContent =
      `⚠️ Usando dados locais (última atualização: ${new Date(data).toLocaleString()})`;
  } catch (e) {
    console.error("Erro ao carregar dados locais:", e);
  }
}

// (Aqui entram suas funções renderTabela, renderCabecalho, formatarData, filtros,
// gerarGráficos, gerarRanking, exportarExcel/CSV/PDF, etc.)

    renderCabecalho();
    renderTabela(dadosGestor);
    gerarGraficos(dadosGestor);
    gerarRanking(dadosGestor);

    document.getElementById("statusAtualiza").textContent =
      `⚠️ Usando dados locais (última atualização: ${new Date(data).toLocaleString()})`;
  } catch (e) {
    console.error("Erro ao carregar dados locais:", e);
  }
}
// Renderiza o cabeçalho da tabela
function renderCabecalho() {
  const head = document.getElementById("cabecalhoGestor");
  head.innerHTML = cabecalhos.map(c => 
    `<th>${c.replace(/([A-Z])/g, ' $1').trim()}</th>`
  ).join("");
}

// Renderiza as linhas da tabela
function renderTabela(dados) {
  const tbody = document.querySelector("#tabelaGestor tbody");
  tbody.innerHTML = "";

  dados.forEach(linha => {
    const tr = document.createElement("tr");
    
    linha.forEach((cel, index) => {
      const td = document.createElement("td");
      // Formatação especial para colunas específicas
      if (cabecalhos[index].toLowerCase().includes("data") && cel) {
        td.textContent = formatarData(cel);
      } else if (cabecalhos[index].toLowerCase().includes("hora") && cel) {
        td.textContent = formatarHora(cel);
      } else {
        td.textContent = cel;
      }
      tr.appendChild(td);
    });

    tr.onclick = () => {
      document.querySelectorAll("tbody tr").forEach(row => row.classList.remove("destacado"));
      tr.classList.add("destacado");
    };

    tbody.appendChild(tr);
  });
}

// Funções auxiliares de formatação
function formatarData(valor) {
  try {
    if (typeof valor === 'string' && valor.includes('/')) return valor;
    const date = new Date(valor);
    return isNaN(date) ? valor : date.toLocaleDateString('pt-BR');
  } catch {
    return valor;
  }
}

function formatarHora(valor) {
  try {
    if (typeof valor === 'string' && valor.includes(':')) return valor;
    const date = new Date(valor);
    return isNaN(date) ? valor : date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return valor;
  }
}

// Filtro por loja
function filtrarLoja(loja) {
  lojaAtual = loja;
  filtrarDadosGestor();
}

// Filtro geral (loja + busca textual)
function filtrarDadosGestor() {
  const termo = document.getElementById("buscaGestor").value.toLowerCase();
  const colLoja = cabecalhos.findIndex(c => c.toLowerCase().includes("loja"));

  const filtrado = dadosGestor.filter(linha => {
    const textoLinha = linha.join(" ").toLowerCase();
    const condTexto = textoLinha.includes(termo);
    const condLoja = lojaAtual === "Todos" || 
                     (colLoja >= 0 && linha[colLoja]?.toString().includes(lojaAtual));
    return condTexto && condLoja;
  });

  renderTabela(filtrado);
  gerarGraficos(filtrado);
  gerarRanking(filtrado);
}

// Gerar gráficos dinâmicos
function gerarGraficos(dados) {
  // Limpa gráficos existentes
  [chartLoja, chartDia, chartPromotor].forEach(chart => chart?.destroy());

  // Obtém índices das colunas
  const colLoja = cabecalhos.findIndex(c => c.toLowerCase().includes("loja"));
  const colDia = cabecalhos.findIndex(c => c.toLowerCase().includes("dia"));
  const colPromotor = cabecalhos.findIndex(c => c.toLowerCase().includes("nome"));

  // Contagens para os gráficos
  const contagens = {
    loja: contarOcorrencias(dados, colLoja),
    dia: contarOcorrencias(dados, colDia),
    promotor: contarOcorrencias(dados, colPromotor)
  };

  // Cria os gráficos
  chartLoja = criarGraficoBarras('graficoLoja', 'Atendimentos por Loja', contagens.loja);
  chartDia = criarGraficoLinhas('graficoDia', 'Atendimentos por Dia', contagens.dia);
  chartPromotor = criarGraficoPizza('graficoPromotor', 'Atendimentos por Promotor', contagens.promotor);
}

// Função auxiliar para contar ocorrências
function contarOcorrencias(dados, colunaIndex) {
  const contagem = {};
  dados.forEach(linha => {
    const valor = colunaIndex >= 0 ? linha[colunaIndex] : "";
    const chave = valor || "Não informado";
    contagem[chave] = (contagem[chave] || 0) + 1;
  });
  return contagem;
}

// Funções para criação de gráficos
function criarGraficoBarras(elementId, label, dados) {
  return new Chart(document.getElementById(elementId), {
    type: 'bar',
    data: {
      labels: Object.keys(dados),
      datasets: [{
        label: label,
        data: Object.values(dados),
        backgroundColor: '#00C853'
      }]
    },
    options: getChartOptions()
  });
}

function criarGraficoLinhas(elementId, label, dados) {
  return new Chart(document.getElementById(elementId), {
    type: 'line',
    data: {
      labels: Object.keys(dados),
      datasets: [{
        label: label,
        data: Object.values(dados),
        borderColor: '#EF5350',
        backgroundColor: '#EF5350',
        fill: false
      }]
    },
    options: getChartOptions()
  });
}

function criarGraficoPizza(elementId, label, dados) {
  return new Chart(document.getElementById(elementId), {
    type: 'pie',
    data: {
      labels: Object.keys(dados),
      datasets: [{
        label: label,
        data: Object.values(dados),
        backgroundColor: [
          '#00C853', '#EF5350', '#FFC107', '#29B6F6', 
          '#AB47BC', '#FF7043', '#26A69A', '#EC407A'
        ]
      }]
    },
    options: getChartOptions()
  });
}

// Configurações comuns dos gráficos
function getChartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { 
        labels: { 
          color: '#fff',
          font: { family: "'Ubuntu', sans-serif" }
        } 
      } 
    },
    scales: {
      x: { ticks: { color: '#fff', font: { family: "'Ubuntu', sans-serif" } } },
      y: { ticks: { color: '#fff', font: { family: "'Ubuntu', sans-serif" } } }
    }
  };
}

// Gerar ranking de promotores
function gerarRanking(dados) {
  const colPromotor = cabecalhos.findIndex(c => c.toLowerCase().includes("nome"));
  const colMarca = cabecalhos.findIndex(c => c.toLowerCase().includes("marca"));
  const colLoja = cabecalhos.findIndex(c => c.toLowerCase().includes("loja"));

  const { marcas, cobertura } = dados.reduce((acc, linha) => {
    // Contagem por marca
    const marca = linha[colMarca] || "Desconhecida";
    acc.marcas[marca] = (acc.marcas[marca] || 0) + 1;

    // Contagem por promotor (cobertura de lojas)
    const promotor = linha[colPromotor] || "Desconhecido";
    const loja = linha[colLoja] || "";
    if (loja) {
      if (!acc.cobertura[promotor]) acc.cobertura[promotor] = new Set();
      acc.cobertura[promotor].add(loja);
    }

    return acc;
  }, { marcas: {}, cobertura: {} });

  // Converter Set para contagem
  const contagemCobertura = Object.fromEntries(
    Object.entries(cobertura).map(([promotor, lojas]) => [promotor, lojas.size])
  );

  // Atualizar HTML com os rankings
  atualizarRankingHTML("topMarcas", ordenarRanking(marcas), "atendimentos");
  atualizarRankingHTML("topCobertura", ordenarRanking(contagemCobertura), "lojas");
}

function ordenarRanking(dados) {
  return Object.entries(dados)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
}

function atualizarRankingHTML(elementId, ranking, unidade) {
  const lista = document.getElementById(elementId);
  lista.innerHTML = ranking.map(([item, qtd], i) => 
    `<li>${i+1}º ${item} - ${qtd} ${unidade}</li>`
  ).join("");
}

// Exportação de dados
function exportarExcel() {
  const tabela = document.getElementById('tabelaGestor');
  const wb = XLSX.utils.table_to_book(tabela, { sheet: "Relatório" });
  XLSX.writeFile(wb, "Relatorio_Gestor.xlsx");
}

function exportarCSV() {
  const tabela = document.getElementById('tabelaGestor');
  const wb = XLSX.utils.table_to_book(tabela, { sheet: "Relatório" });
  XLSX.writeFile(wb, "Relatorio_Gestor.csv");
}

async function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const tabela = document.getElementById('tabelaGestor');

  const canvas = await html2canvas(tabela, { 
    scale: 2,
    logging: true,
    useCORS: true
  });

  const pdf = new jsPDF('l', 'pt', 'a4');
  const imgData = canvas.toDataURL('image/png');
  const imgWidth = pdf.internal.pageSize.getWidth() - 40;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
  pdf.save("Relatorio_Gestor.pdf");
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  // Configuração inicial
  if (!window.PLANILHA_URL) {
    console.error("PLANILHA_URL não definida");
    document.getElementById("statusAtualiza").textContent = 
      "❌ Erro: URL da planilha não configurada";
    return;
  }

  // Carrega dados locais primeiro para exibição rápida
  usarDadosLocais();
  
// Inicialização única
document.addEventListener("DOMContentLoaded", () => {
  usarDadosLocais();
  atualizarPlanilha();
  setInterval(atualizarPlanilha, 300_000);
});

// Limpeza ao sair da página
window.addEventListener("beforeunload", () => {
  [chartLoja, chartDia, chartPromotor].forEach(c => c?.destroy());
});
