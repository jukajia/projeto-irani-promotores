// gestor.js

// Carregamento Google Charts e atualização inicial
google.charts.load('current', { packages: ['corechart', 'table'] });
google.charts.setOnLoadCallback(atualizarPlanilha);


let dadosGestor = [];
let cabecalhos = [];
let lojaSelecionada = "TODAS";
let diaSelecionado = "Todos os Dias";

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
    aplicarFiltros();
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

function aplicarFiltros() {
  const idxLoja = cabecalhos.findIndex(h => h?.toLowerCase() === "loja");
  const idxDia = cabecalhos.findIndex(h => h?.toLowerCase().includes("dia"));

  const dadosFiltrados = dadosGestor.filter(linha => {
    const lojaValida = lojaSelecionada === "TODAS" || (linha[idxLoja] ?? "").includes(lojaSelecionada);
    const diasTexto = (linha[idxDia] ?? "").toLowerCase();
    const diaValido = diaSelecionado === "Todos os Dias" || diasTexto.includes(diaSelecionado.toLowerCase());
    return lojaValida && diaValido;
  });

  renderizarTudo(dadosFiltrados);
}

function renderizarTudo(dados) {
  renderCabecalho();
  renderTabela(dados);
  gerarGraficosCompletos(dados);
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

      if ((i === idxTelefoneSupervisor || i === idxTelefoneEmpresa || i === 9) && celula != null) {
        const telefone = String(celula).trim().replace(/\D/g, "");
        td.innerHTML = `<a href="https://wa.me/${telefone}" target="_blank" style="color:#25D366;">${celula}</a>`;
      } else {
        td.textContent = celula ?? "";
      }

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });


function gerarGraficosCompletos(dados) {
  const idxPromotor = cabecalhos.findIndex(h => h.toLowerCase().includes("promotor"));
  const idxDiasSemana = cabecalhos.findIndex(h => h.toLowerCase().includes("dia"));
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

  ["graficoPromotorDias", "graficoPromotoresPorLoja", "graficoDiasSemana"].forEach(id => {
    const canvas = document.getElementById(id);
    const novo = document.createElement("canvas");
    novo.id = id;
    canvas.replaceWith(novo);
  });

  new Chart(document.getElementById("graficoPromotorDias"), {
    type: 'bar',
    data: {
      labels: Object.keys(promotoresDias),
      datasets: [{ label: 'Dias por semana', data: Object.values(promotoresDias).map(set => set.size), backgroundColor: '#00c853' }]
    },
    options: chartOptions()
  });

  new Chart(document.getElementById("graficoPromotoresPorLoja"), {
    type: 'bar',
    data: {
      labels: Object.keys(promotoresPorLoja),
      datasets: [{ label: 'Promotores por Loja', data: Object.values(promotoresPorLoja).map(set => set.size), backgroundColor: '#2196f3' }]
    },
    options: chartOptions()
  });

  new Chart(document.getElementById("graficoDiasSemana"), {
    type: 'bar',
    data: {
      labels: Object.keys(diasDistribuidos),
      datasets: [{ label: 'Atendimentos por Dia', data: Object.values(diasDistribuidos), backgroundColor: '#ff6f00' }]
    },
    options: chartOptions()
  });

  const ranking = Object.entries(promotoresDias)
    .map(([nome, dias]) => ({ nome, dias: dias.size }))
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

// Filtros

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("#filtrosLojas .loja-button").forEach(btn => {
    btn.addEventListener("click", () => {
      lojaSelecionada = btn.textContent.includes("Todas") ? "TODAS" : btn.textContent.split(" - ")[1];
      aplicarFiltros();
      document.querySelectorAll(".loja-button").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });

  document.querySelectorAll("#filtrosDias .dia-button").forEach(btn => {
    btn.addEventListener("click", () => {
      diaSelecionado = btn.textContent.trim();
      aplicarFiltros();
      document.querySelectorAll(".dia-button").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });
});

// Exportação
function exportarExcel() {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.table_to_sheet(document.getElementById("tabelaGestor"));
  XLSX.utils.book_append_sheet(wb, ws, "Relatorio");
  XLSX.writeFile(wb, "relatorio-gestor.xlsx");
}

function exportarPDF() {
  const pdf = new jspdf.jsPDF('l', 'mm', 'a4');

  const table = document.getElementById("tabelaGestor");
  const rows = Array.from(table.querySelectorAll("tbody tr")).map(tr =>
    Array.from(tr.querySelectorAll("td")).map(td => td.innerText.trim())
  );
  const headers = Array.from(table.querySelectorAll("thead th")).map(th => th.innerText.trim());

  pdf.autoTable({
    head: [headers],
    body: rows,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
    margin: { top: 20 },
  });

  pdf.save("relatorio-gestor.pdf");
}
