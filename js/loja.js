google.charts.load('current', { packages: ['corechart', 'table'] });
google.charts.setOnLoadCallback(carregarLoja);

let dadosLoja = [];
let cabecalhos = [];

function carregarLoja() {
  const params = new URLSearchParams(window.location.search);
  const codigoLoja = params.get("loja");
  if (!codigoLoja) return;

  document.getElementById("tituloLoja").textContent += ` - Loja ${codigoLoja}`;

  const query = new google.visualization.Query(window.PLANILHAS.lojas);
  query.send(response => {
    if (response.isError()) {
      console.error("Erro ao carregar loja: ", response.getMessage());
      return;
    }
    const dataTable = response.getDataTable();

    cabecalhos = [];
    dadosLoja = [];

    for (let c = 0; c < dataTable.getNumberOfColumns(); c++) {
      cabecalhos.push(dataTable.getColumnLabel(c));
    }

    for (let r = 0; r < dataTable.getNumberOfRows(); r++) {
      const loja = dataTable.getValue(r, cabecalhos.findIndex(h => h.toLowerCase() === "loja"));
      if (loja !== codigoLoja) continue;

      const linha = [];
      for (let c = 0; c < dataTable.getNumberOfColumns(); c++) {
        linha.push(dataTable.getValue(r, c));
      }
      dadosLoja.push(linha);
    }

    renderTabelaLoja(dadosLoja);
  });
}

function renderTabelaLoja(dados) {
  const tbody = document.querySelector("#tabelaPublica tbody");
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
