google.charts.load('current', { packages: ['corechart', 'table'] });
google.charts.setOnLoadCallback(atualizarPlanilha);

let dadosGestor = [];
let cabecalhos = [];
let lojaSelecionada = "TODAS";
let termoBusca = "";

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
  renderizarFiltrosLojas(dadosGestor);
  const dadosFiltrados = aplicarFiltros(dadosGestor);
  renderTabela(dadosFiltrados);
  gerarGraficosCompletos(dadosFiltrados);
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
        td.innerHTML = `<a href="https://wa.me/${telefone}" target="_blank" rel="noopener noreferrer" style="color:#25D366;">${celula}</a>`;
      } else {
        td.textContent = celula ?? "";
      }
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
}

function renderizarFiltrosLojas(dados) {
  const container = document.getElementById("filtrosLojas");
  container.innerHTML = "";

  const idxLoja = cabecalhos.findIndex(h => h?.toLowerCase() === "loja");
  const lojas = new Set(dados.map(l => l[idxLoja]).filter(Boolean));

  // Botão "Todas"
  const botaoTodas = document.createElement("button");
  botaoTodas.textContent = "Todas";
  botaoTodas.className = "loja-button" + (lojaSelecionada === "TODAS" ? " selected" : "");
  botaoTodas.onclick = () => {
    lojaSelecionada = "TODAS";
    atualizarFiltro();
  };
  container.appendChild(botaoTodas);

  lojas.forEach(loja => {
    const botao = document.createElement("button");
    botao.textContent = loja;
    botao.className = "loja-button" + (lojaSelecionada === loja ? " selected" : "");
    botao.onclick = () => {
      lojaSelecionada = loja;
      atualizarFiltro();
    };
    container.appendChild(botao);
  });
}

function atualizarFiltro() {
  renderizarTudo(dadosGestor);
}

function aplicarFiltros(dados) {
  const idxLoja = cabecalhos.findIndex(h => h?.toLowerCase() === "loja");
  return dados.filter(linha => {
    const loja = String(linha[idxLoja] ?? "").toLowerCase();
    const textoLinha = linha.join(" ").toLowerCase();
    const correspondeLoja = lojaSelecionada === "TODAS" || loja.includes(lojaSelecionada.toLowerCase());
    const correspondeBusca = !termoBusca || textoLinha.includes(termoBusca.toLowerCase());
    return correspondeLoja && correspondeBusca;
  });
}

function filtrarDadosGestor() {
  termoBusca = document.getElementById("buscaGestor").value;
  renderizarTudo(dadosGestor);
}

function gerarGraficosCompletos(dados) {
  const idxPromotor = cabecalhos.findIndex(h => h.toLowerCase().includes("promotor"));
  const idxDiasSemana = cabecalhos.findIndex(h => h.toLowerCase().includes("dias da semana"));
  const idxLoja = cabecalhos.findIndex(h => h.toLowerCase() === "loja");

  const promotoresDias = {};
  const promotoresPorLoja = {};
  const diasDistribuidos = { "Segunda": 0, "Terça": 0, "Quarta": 0, "Quinta": 0, "Sexta": 0, "Sábado": 0, "Domingo": 0 };

  dados.forEach(linha => {
    const nome = linha[idxPromotor] ?? "Sem nome";
    const loja = linha[idxLoja] ?? "Sem loja";
    const dias = (linha[idxDiasSemana] ?? "").split(/[,;]+/).map(d => d.trim());

    if (!promotoresDias[nome]) promotoresDias[nome] = new Set();
    dias.forEach(dia => promotoresDias[nome].add(dia));

    if (!promotoresPorLoja[loja]) promotoresPorLoja[loja] = new Set();
    promotoresPorLoja[loja].add(nome);

    dias.forEach(d => {
      if (diasDistribuidos[d] != null) diasDistribuidos[d]++;
    });
  });

  // Limpa gráficos
  const graficos = ["graficoPromotorDias", "graficoPromotoresPorLoja", "graficoDiasSemana"];
  graficos.forEach(id => {
    const canvas = document.getElementById(id);
    const novo = document.createElement("canvas");
    novo.id = id;
    canvas.replaceWith(novo);
  });

  // 1. Promotor x Dias
  const nomes = Object.keys(promotoresDias);
  const qtdDias = nomes.map(n => promotoresDias[n].size);
  new Chart(document.getElementById("graficoPromotorDias"), {
    type: 'bar',
    data: {
      labels: nomes,
      datasets: [{ label: 'Dias por semana', data: qtdDias, backgroundColor: '#00c853' }]
    },
    options: chartOptions()
  });

  // 2. Promotores por Loja
  new Chart(document.getElementById("graficoPromotoresPorLoja"), {
    type: 'bar',
    data: {
      labels: Object.keys(promotoresPorLoja),
      datasets: [{ label: 'Promotores por Loja', data: Object.values(promotoresPorLoja).map(set => set.size), backgroundColor: '#2196f3' }]
    },
    options: chartOptions()
  });

  // 3. Atendimentos por Dia da Semana
  new Chart(document.getElementById("graficoDiasSemana"), {
    type: 'bar',
    data: {
      labels: Object.keys(diasDistribuidos),
      datasets: [{ label: 'Atendimentos por Dia', data: Object.values(diasDistribuidos), backgroundColor: '#ff6f00' }]
    },
    options: chartOptions()
  });

  // 4. Ranking
  const ranking = nomes
    .map((n, i) => ({ nome: n, dias: qtdDias[i] }))
    .sort((a, b) => b.dias - a.dias)
    .slice(0, 10);

  document.getElementById("rankingPromotores").innerHTML = ranking
    .map(p => `<li>${p.nome} - ${p.dias} dias</li>`).join("");
}

function chartOptions() {
  return {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#fff" } }
    },
    scales: {
      x: { ticks: { color: "#fff" } },
      y: { beginAtZero: true, ticks: { color: "#fff" } }
    }
  };
}
