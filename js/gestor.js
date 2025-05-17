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

    renderizarTudo(dadosGestor);
    status.textContent = "✅ Dados atualizados";
  });
}

function renderizarTudo(dados) {
  renderCabecalho();
  renderTabela(dados);
  gerarGraficoPizza(dados); // gráfico único, pizza
}

function renderCabecalho() {
  const head = document.getElementById("cabecalhoGestor");
  head.innerHTML = cabecalhos.map(h => `<th>${h}</th>`).join("");
}

function renderTabela(dados) {
  const tbody = document.querySelector("#tabelaGestor tbody");
  tbody.innerHTML = "";

  const idxTelefoneSupervisor = cabecalhos.findIndex(h => h.toLowerCase().includes("telefone supervisor"));
  const idxTelefoneEmpresa = cabecalhos.findIndex(h => h.toLowerCase().includes("telefone empresa"));

  dados.forEach(linha => {
    const tr = document.createElement("tr");
    linha.forEach((cel, i) => {
      const td = document.createElement("td");
      if ((i === idxTelefoneSupervisor || i === idxTelefoneEmpresa) && cel) {
        const texto = String(cel).trim();
        const limpo = texto.replace(/\D/g, "");
        td.innerHTML = `<a href="https://wa.me/${limpo}" target="_blank" style="color:#25D366;">${texto}</a>`;
      } else {
        td.textContent = cel ?? "";
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function filtrarPorLoja(codigo) {
  document.querySelectorAll("#filtrosLojas .loja-button").forEach(btn => btn.classList.remove("selected"));
  const btn = Array.from(document.querySelectorAll("#filtrosLojas .loja-button")).find(b => b.textContent.includes(codigo) || codigo === "TODAS");
  if (btn) btn.classList.add("selected");

  const idxLoja = cabecalhos.findIndex(h => h.toLowerCase() === "loja");
  if (codigo === "TODAS" || idxLoja === -1) {
    renderizarTudo(dadosGestor);
  } else {
    const filtrados = dadosGestor.filter(l => (l[idxLoja] + "").includes(codigo));
    renderizarTudo(filtrados);
  }
}

function gerarGraficoPizza(dados) {
  const idxLoja = cabecalhos.findIndex(h => h.toLowerCase() === "loja");
  if (idxLoja === -1) return;

  const mapa = {};
  dados.forEach(l => {
    const loja = l[idxLoja] ?? "Não informado";
    mapa[loja] = (mapa[loja] ?? 0) + 1;
  });

  const data = new google.visualization.DataTable();
  data.addColumn('string', 'Loja');
  data.addColumn('number', 'Qtd Atendimentos');

  Object.entries(mapa).forEach(([loja, qtd]) => {
    data.addRow([loja, qtd]);
  });

  const chart = new google.visualization.PieChart(document.getElementById('graficoPizza'));
  chart.draw(data, {
    title: 'Distribuição de Atendimentos por Loja',
    backgroundColor: 'transparent',
    legend: { textStyle: { color: '#fff' } },
    titleTextStyle: { color: '#fff' },
    pieSliceTextStyle: { color: '#000' },
  });
}
