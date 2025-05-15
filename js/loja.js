google.charts.load('current', { packages: ['corechart', 'table'] });
google.charts.setOnLoadCallback(carregarLoja);

let dadosLoja = [];
let cabecalhos = [];

// Dicionário de códigos → nomes reais da planilha
const mapaLojas = {
  "001": "Brasil 001",
  "002": "Parque Verde 002",
  "003": "Floresta 003",
  "004": "Tancredo 004",
  "005": "Gourmet 005",
  "201": "Portí Cascavel 201",
  "202": "Portí Foz do Iguaçu 202",
  "203": "Portí Cascavel 203",
  "204": "Portí Cascavel 204"
};

function carregarLoja() {
  const params = new URLSearchParams(window.location.search);
  const codigoLoja = params.get("loja");

  if (!codigoLoja || !mapaLojas[codigoLoja]) {
    console.warn("Código da loja ausente ou inválido na URL.");
    return;
  }

  const nomeLoja = mapaLojas[codigoLoja];
  document.getElementById("tituloLoja").textContent = `Relatório de Promotores - ${nomeLoja}`;

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

    const idxLoja = cabecalhos.findIndex(h => h && h.toLowerCase().includes("loja"));
    if (idxLoja === -1) {
      console.error("Coluna 'Loja' não encontrada.");
      return;
    }

    for (let r = 0; r < dataTable.getNumberOfRows(); r++) {
      const lojaNaLinha = dataTable.getValue(r, idxLoja);
      if (String(lojaNaLinha).trim().toLowerCase() !== nomeLoja.trim().toLowerCase()) continue;

      const linha = [];
      for (let c = 0; c < dataTable.getNumberOfColumns(); c++) {
        linha.push(dataTable.getValue(r, c));
      }
      dadosLoja.push(linha);
    }

    renderTabelaLoja(dadosLoja);
  });
}

function filtrarDadosPublicoLocal() {
  const termo = document.getElementById("buscaPublica").value.toLowerCase();
  const filtrado = dadosLoja.filter(item =>
    item.some(cel => String(cel).toLowerCase().includes(termo))
  );
  renderTabelaLoja(filtrado);
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
