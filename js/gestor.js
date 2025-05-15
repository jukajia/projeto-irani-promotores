const PLANILHA_URL = window.PLANILHAS.gestor;
let dadosGestor = [];
let cabecalhos = [];
let chartDia, chartPromotor;

async function atualizarPlanilha() {
  const status = document.getElementById("statusAtualiza");
  status.textContent = "⏳ Carregando…";
  
  try {
    const res = await fetch(`${PLANILHA_URL}&t=${Date.now()}`);
    const text = await res.text();
    const json = JSON.parse(text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*?)\);/)[1]);

    cabecalhos = json.table.cols.map(c => c.label);
    dadosGestor = json.table.rows.map(r => r.c.map(cell => cell?.f ?? cell?.v ?? ""));
    
    localStorage.setItem("dadosGestor", JSON.stringify({
      data: Date.now(),
      cabecalhos,
      dados: dadosGestor
    }));

    renderizarTudo(dadosGestor);
    status.textContent = "✅ Atualizado!";
  } catch (error) {
    console.error("Erro:", error);
    status.textContent = "❌ Erro ao atualizar!";
    usarDadosLocais();
  }
}

function filtrarDadosGestor() {
  const termo = document.getElementById("buscaGestor").value.toLowerCase();
  const filtrado = dadosGestor.filter(linha => 
    linha.join(" ").toLowerCase().includes(termo)
  );
  renderTabela(filtrado);
  gerarGraficos(filtrado);
}

// ... (mantenha as outras funções como renderizarTudo, renderCabecalho, etc)
// Centraliza renderização após carregar dados
function renderizarTudo(dados) {
  renderCabecalho();
  renderTabela(dados);
  gerarGraficos(dados);
  gerarRanking(dados);
}

// Renderiza o cabeçalho
function renderCabecalho() {
  const head = document.getElementById("cabecalhoGestor");
  head.innerHTML = cabecalhos.map(c =>
    `<th>${c.replace(/([A-Z])/g, ' $1').trim()}</th>`
  ).join("");
}

// Renderiza a tabela de dados
function renderTabela(dados) {
  const tbody = document.querySelector("#tabelaGestor tbody");
  tbody.innerHTML = "";

  dados.forEach(linha => {
    const tr = document.createElement("tr");

    linha.forEach((cel, index) => {
      const td = document.createElement("td");
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

// Formata datas
function formatarData(valor) {
  try {
    if (typeof valor === 'string' && valor.includes('/')) return valor;
    const date = new Date(valor);
    return isNaN(date) ? valor : date.toLocaleDateString('pt-BR');
  } catch {
    return valor;
  }
}

// Formata horas
function formatarHora(valor) {
  try {
    if (typeof valor === 'string' && valor.includes(':')) return valor;
    const date = new Date(valor);
    return isNaN(date) ? valor : date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return valor;
  }
}

// Filtra por loja
function filtrarLoja(loja) {
  lojaAtual = loja;
  filtrarDadosGestor();
}

// Filtra por texto e loja
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
function gerarGraficos(dados) {
  [chartDia, chartPromotor].forEach(chart => chart?.destroy());
  
  const colDia = cabecalhos.findIndex(c => c.toLowerCase().includes("dia"));
  const colPromotor = cabecalhos.findIndex(c => c.toLowerCase().includes("nome"));

  const contagens = {
    dia: contarOcorrencias(dados, colDia),
    promotor: contarOcorrencias(dados, colPromotor)
  };

  chartDia = criarGraficoLinhas('graficoDia', 'Atendimentos por Dia', contagens.dia);
  chartPromotor = criarGraficoPizza('graficoPromotor', 'Atendimentos por Promotor', contagens.promotor);
}

// Geração de gráficos
function gerarGraficos(dados) {
  [chartLoja, chartDia, chartPromotor].forEach(chart => chart?.destroy());

  const colLoja = cabecalhos.findIndex(c => c.toLowerCase().includes("loja"));
  const colDia = cabecalhos.findIndex(c => c.toLowerCase().includes("dia"));
  const colPromotor = cabecalhos.findIndex(c => c.toLowerCase().includes("nome"));

  const contagens = {
    loja: contarOcorrencias(dados, colLoja),
    dia: contarOcorrencias(dados, colDia),
    promotor: contarOcorrencias(dados, colPromotor)
  };

  chartLoja = criarGraficoBarras('graficoLoja', 'Atendimentos por Loja', contagens.loja);
  chartDia = criarGraficoLinhas('graficoDia', 'Atendimentos por Dia', contagens.dia);
  chartPromotor = criarGraficoPizza('graficoPromotor', 'Atendimentos por Promotor', contagens.promotor);
}

// Conta ocorrências
function contarOcorrencias(dados, colunaIndex) {
  const contagem = {};
  dados.forEach(linha => {
    const valor = colunaIndex >= 0 ? linha[colunaIndex] : "";
    const chave = valor || "Não informado";
    contagem[chave] = (contagem[chave] || 0) + 1;
  });
  return contagem;
}

// Criação dos gráficos
function criarGraficoBarras(elementId, label, dados) {
  return new Chart(document.getElementById(elementId), {
    type: 'bar',
    data: {
      labels: Object.keys(dados),
      datasets: [{
        label,
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
        label,
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
        label,
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

// Configurações dos gráficos
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

// Ranking
function gerarRanking(dados) {
  const colPromotor = cabecalhos.findIndex(c => c.toLowerCase().includes("nome"));
  const colMarca = cabecalhos.findIndex(c => c.toLowerCase().includes("marca"));
  const colLoja = cabecalhos.findIndex(c => c.toLowerCase().includes("loja"));

  const { marcas, cobertura } = dados.reduce((acc, linha) => {
    const marca = linha[colMarca] || "Desconhecida";
    acc.marcas[marca] = (acc.marcas[marca] || 0) + 1;

    const promotor = linha[colPromotor] || "Desconhecido";
    const loja = linha[colLoja] || "";
    if (loja) {
      acc.cobertura[promotor] ??= new Set();
      acc.cobertura[promotor].add(loja);
    }

    return acc;
  }, { marcas: {}, cobertura: {} });

  const contagemCobertura = Object.fromEntries(
    Object.entries(cobertura).map(([promotor, lojas]) => [promotor, lojas.size])
  );

  atualizarRankingHTML("topMarcas", ordenarRanking(marcas), "atendimentos");
  atualizarRankingHTML("topCobertura", ordenarRanking(contagemCobertura), "lojas");
}

// Auxiliar de ranking
function ordenarRanking(dados) {
  return Object.entries(dados)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
}

function atualizarRankingHTML(elementId, ranking, unidade) {
  const lista = document.getElementById(elementId);
  lista.innerHTML = ranking.map(([item, qtd], i) =>
    `<li>${i + 1}º ${item} - ${qtd} ${unidade}</li>`
  ).join("");
}

// Exportação
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
  if (!PLANILHA_URL) {
    console.error("PLANILHA_URL não definida");
    document.getElementById("statusAtualiza").textContent = 
      "❌ Erro: URL da planilha não configurada";
    return;
  }

  usarDadosLocais();
  atualizarPlanilha();
  setInterval(atualizarPlanilha, 300_000); // Atualiza a cada 5 minutos
});

// Limpeza
window.addEventListener("beforeunload", () => {
  [chartLoja, chartDia, chartPromotor].forEach(c => c?.destroy());
});
