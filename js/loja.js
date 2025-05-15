google.charts.load('current', { packages: ['corechart', 'table'] });
google.charts.setOnLoadCallback(carregarLoja);

let dadosLoja = [];
let cabecalhos = [];

function carregarLoja() {
  const params = new URLSearchParams(window.location.search);
  const codigoLoja = params.get("loja");
  if (!codigoLoja) {
    console.warn("Código da loja ausente na URL.");
    return;
  }

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

    console.log("Cabeçalhos da planilha:", cabecalhos);

    const idxLoja = cabecalhos.findIndex(h => h && h.toLowerCase().includes("loja"));
    console.log("Índice da coluna 'Loja':", idxLoja);

    for (let r = 0; r < dataTable.getNumberOfRows(); r++) {
      const loja = dataTable.getValue(r, idxLoja);
      console.log(`Linha ${r} Loja:`, loja);

      //if (String(loja) !== codigoLoja) continue;

      const linha = [];
      for (let c = 0; c < dataTable.getNumberOfColumns(); c++) {
        linha.push(dataTable.getValue(r, c));
      }
      dadosLoja.push(linha);
    }

    console.log("Linhas filtradas:", dadosLoja);

    renderTabelaLoja(dadosLoja);
  });
}
