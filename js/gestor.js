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

    const data = response.getDataTable();
    processarDados(data);
    renderizarTudo(dadosGestor);
    status.textContent = "✅ Dados atualizados";
  });
}

function processarDados(dataTable) {
  cabecalhos = [];
  dadosGestor = [];

  for (let c = 0; c < dataTable.getNumberOfColumns(); c++) {
    cabecalhos.push(dataTable.getColumnLabel(c));
  }

  for (let r = 0; r < dataTable.getNumberOfRows(); r++) {
    const linha = [];
    for (let c = 0; c < dataTable.getNumberOfColumns(); c++) {
      linha.push(dataTable.getValue(r, c));
    }
    dadosGestor.push(linha);
  }
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

  const idxTelefoneSupervisor = cabecalhos.findIndex(h => h?.toLowerCase().includes("telefone supervisor"));
  const idxTelefoneEmpresa = cabecalhos.findIndex(h => h?.toLowerCase().includes("telefone empresa"));

  dados.forEach(linha => {
    const tr = document.createElement("tr");

    linha.forEach((celula, i) => {
      const td = document.createElement("td");
      if ((i === idxTelefoneSupervisor || i === idxTelefoneEmpresa) && celula != null) {
        const telefone = String(celula).trim().replace(/\D/g, "");
        td.innerHTML = `<a href="https://wa.me/${telefone}" target="_blank" rel="noopener noreferrer" style="color:#25D366; text-decoration:none;">${celula}</a>`;
      } else {
        td.textContent = celula ?? "";
      }
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
}

function filtrarPorLoja(codigo) {
  // Destaca botão selecionado
  document.querySelectorAll("#filtrosLojas .loja-button").forEach(btn => btn.classList.remove("selected"));
  const botaoSelecionado = Array.from(document.querySelectorAll("#filtrosLojas .loja-button"))
    .find(btn => btn.textContent.includes(codigo) || codigo === "TODAS");
  if (botaoSelecionado) botaoSelecionado.classList.add("selected");

  // Filtra dados
  const idxLoja = cabecalhos.findIndex(h => h?.toLowerCase() === "loja");

  const dadosFiltrados = (codigo === "TODAS" || idxLoja === -1)
    ? dadosGestor
    : dadosGestor.filter(linha => String(linha[idxLoja] ?? "").includes(codigo));

  renderizarTudo(dadosFiltrados);
}

function gerarGraficos(dados) {
  const idxDia = cabecalhos.findIndex(h => h?.toLowerCase().includes("dias da semana"));
  const idxLoja = cabecalhos.findIndex(h => h?.toLowerCase() === "loja");

  // Limpa e recria canvas para evitar erro de contexto duplicado
  ['graficoDia', 'graficoPromotor'].forEach(id => {
    const oldCanvas = document.getElementById(id);
    const newCanvas = document.createElement('canvas');
    newCanvas.id = id;
    oldCanvas.replaceWith(newCanvas);
  });

  const contDia = contarOcorrencias(dados, idxDia);
  const contLoja = contarOcorrencias(dados, idxLoja);

  window.chartDia = criarGraficoBarra('graficoDia', 'Atendimentos por Dia', contDia);
  window.chartLoja = criarGraficoBarra('graficoPromotor', 'Atendimentos por Loja', contLoja);
}

function contarOcorrencias(dados, idx) {
  const contagem = {};
  dados.forEach(linha => {
    const chave = linha[idx] ?? "Não informado";
    contagem[chave] = (contagem[chave] ?? 0) + 1;
  });
  return contagem;
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
