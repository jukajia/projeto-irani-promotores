google.charts.load('current', { packages: ['corechart', 'table'] });
google.charts.setOnLoadCallback(carregarLoja);

let dadosLoja = [];
let cabecalhos = [];
let filtroDiaSelecionado = "Todos";

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

    aplicarFiltros();
  });

  configurarFiltrosDia();
  configurarRedimensionamento();
}

function configurarFiltrosDia() {
  const containerFiltros = document.getElementById("filtrosDiasLoja");
  if (!containerFiltros) return;

  const botoes = containerFiltros.querySelectorAll(".dia-button");

  botoes.forEach(btn => {
    btn.onclick = () => {
      botoes.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      filtroDiaSelecionado = btn.textContent.trim();
      aplicarFiltros();
    };
  });
}

function configurarRedimensionamento() {
  window.addEventListener('resize', () => {
    aplicarFiltros();
  });
}

function aplicarFiltros() {
  const termoBusca = document.getElementById("buscaPublica")?.value.toLowerCase() || "";
  const idxDiaSemana = 4; // coluna fixa 4 para dias da semana

  let dadosFiltrados = dadosLoja.filter(linha => {
    const correspondeBusca = linha.some(cel => String(cel).toLowerCase().includes(termoBusca));
    if (!correspondeBusca) return false;

    if (filtroDiaSelecionado !== "Todos") {
      const valorDia = linha[idxDiaSemana]?.toString().toLowerCase() || "";
      // Permite várias entradas separadas por vírgula, espaços etc
      return valorDia.split(/\s*,\s*/).some(d => d === filtroDiaSelecionado.toLowerCase());
    }
    return true;
  });

  if (window.innerWidth <= 768) {
    renderTabelaVertical(dadosFiltrados);
  } else {
    renderTabelaHorizontal(dadosFiltrados);
  }
}

function renderTabelaHorizontal(dados) {
  const tbody = document.querySelector("#tabelaPublica tbody");
  const thead = document.querySelector("#tabelaPublica thead");
  tbody.innerHTML = "";
  thead.innerHTML = "";

  if (dados.length === 0) return;

  const headerRow = document.createElement("tr");
  cabecalhos.forEach(label => {
    const th = document.createElement("th");
    th.textContent = label;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  const idxTelefone = cabecalhos.findIndex(h => h && h.toLowerCase().includes("telefone"));

  dados.forEach(linha => {
    const tr = document.createElement("tr");
    linha.forEach((cel, i) => {
      const td = document.createElement("td");
      if (i === idxTelefone && cel) {
        const telefoneTexto = String(cel).trim();
        const telefoneLimpo = telefoneTexto.replace(/\D/g, "");
        td.innerHTML = `<a href="https://wa.me/${telefoneLimpo}" target="_blank" rel="noopener noreferrer" style="color:#25D366;">${telefoneTexto}</a>`;
      } else {
        td.textContent = cel ?? "";
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function renderTabelaVertical(dados) {
  const tbody = document.querySelector("#tabelaPublica tbody");
  const thead = document.querySelector("#tabelaPublica thead");
  tbody.innerHTML = "";
  thead.innerHTML = "";

  if (dados.length === 0) return;

  const headerRow = document.createElement("tr");
  headerRow.appendChild(document.createElement("th")); // canto vazio no cabeçalho
  for (let i = 0; i < dados.length; i++) {
    const th = document.createElement("th");
    th.textContent = `Promotor ${i + 1}`;
    headerRow.appendChild(th);
  }
  thead.appendChild(headerRow);

  const idxTelefone = cabecalhos.findIndex(h => h && h.toLowerCase().includes("telefone"));

  for (let c = 0; c < cabecalhos.length; c++) {
    const tr = document.createElement("tr");

    const th = document.createElement("th");
    th.textContent = cabecalhos[c];
    tr.appendChild(th);

    for (let i = 0; i < dados.length; i++) {
      const td = document.createElement("td");
      const cel = dados[i][c];

      if (c === idxTelefone && cel) {
        const telefoneTexto = String(cel).trim();
        const telefoneLimpo = telefoneTexto.replace(/\D/g, "");
        td.innerHTML = `<a href="https://wa.me/${telefoneLimpo}" target="_blank" rel="noopener noreferrer" style="color:#25D366;">${telefoneTexto}</a>`;
      } else {
        td.textContent = cel ?? "";
      }

      tr.appendChild(td);
    }

    tbody.appendChild(tr);
  }
}
