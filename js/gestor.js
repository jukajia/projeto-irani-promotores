google.charts.load('current', { packages: ['corechart', 'table'] });
google.charts.setOnLoadCallback(atualizarPlanilha);

let dadosGestor = [];
let cabecalhos = [];

function atualizarPlanilha() {
  const status = document.getElementById("statusAtualiza");
  status.textContent = "⏳ Carregando…";

  const query = new google.visualization.Query(window.PLANILHAS.gestor);
  query.send(response => {
    if (response.isError()) {
      status.textContent = "❌ Erro ao carregar planilha";
      console.error(response.getMessage());
      return;
    }

    const dataTable = response.getDataTable();
    cabecalhos = [];
    dadosGestor = [];

    // Carrega cabeçalhos
    for (let c = 0; c < dataTable.getNumberOfColumns(); c++) {
      cabecalhos.push(dataTable.getColumnLabel(c));
    }

    // Carrega linhas
    for (let r = 0; r < dataTable.getNumberOfRows(); r++) {
      const linha = [];
      for (let c = 0; c < dataTable.getNumberOfColumns(); c++) {
        linha.push(dataTable.getValue(r, c));
      }
      dadosGestor.push(linha);
    }

    renderizarTudo(dadosGestor);
    status.textContent = "✅ Dados atualizados";
  });
}

function renderizarTudo(dados) {
  renderCabecalho();
  renderTabela(dados);
  gerarGraficos(dados);
}

function renderCabecalho() {
  const head = document.getElementById("cabecalhoGestor");
  head.innerHTML = cabecalhos.map(h => `<th>${h}</th>`).join("");
}

function renderTabela(dados) {
  const tbody = document.querySelector("#tabelaGestor tbody");
  tbody.innerHTML = "";
  dados.forEach(linha => {
    const tr = document.createElement("tr");
    linha.forEach(cel => {
      const td = document.createElement("td");
      td.textContent = cel ?? "";
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function gerarGraficos(dados) {
  // Exemplo: gráfico simples de quantidade por "Dias da Semana" e "Loja"
  // Encontre índice das colunas que interessam
  const idxDia = cabecalhos.findIndex(h => h.toLowerCase().includes("dias da semana"));
  const idxLoja = cabecalhos.findIndex(h => h.toLowerCase() === "loja");

  if (window.chartDia) window.chartDia.destroy();
  if (window.chartLoja) window.chartLoja.destroy();

  const contDia = contar(dados, idxDia);
  const contLoja = contar(dados, idxLoja);

  window.chartDia = criarGraficoBarra('graficoDia', 'Atendimentos por Dia', contDia);
  window.chartLoja = criarGraficoBarra('graficoPromotor', 'Atendimentos por Loja', contLoja);
}

function contar(dados, idx) {
  const res = {};
  dados.forEach(linha => {
    const chave = linha[idx] ?? "Não informado";
    res[chave] = (res[chave] ?? 0) + 1;
  });
  return res;
}

function criarGraficoBarra(id, label, dados) {
  const ctx = document.getElementById(id);
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(dados),
      datasets: [{
        label,
        data: Object.values(dados),
        backgroundColor: '#00C853'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#fff' } }
      },
      scales: {
        x: { ticks: { color: '#fff' } },
        y: { ticks: { color: '#fff' }, beginAtZero: true }
      }
    }
  });
}
