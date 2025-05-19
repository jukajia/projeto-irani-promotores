google.charts.load('current', { packages: ['corechart', 'table'] });
google.charts.setOnLoadCallback(carregarLoja);

let dadosLoja = [];
let cabecalhos = [];
let filtroDiaSelecionado = "Todos";

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
  "204": "Portí Cascavel 204",
  "999": "Nova Loja Exemplo 999"
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
}

function configurarFiltrosDia() {
  const containerFiltros = document.getElementById("filtrosDiasLoja");
  if (!containerFiltros) return;

  const botoes = containerFiltros.querySelectorAll(".dia-button");

  botoes.forEach(btn => {
    btn.onclick = () => {
      // Remove a seleção anterior
      botoes.forEach(b => b.classList.remove("selected"));
      // Marca o botão clicado como selecionado
      btn.classList.add("selected");
      // Atualiza o filtro de dia selecionado
      filtroDiaSelecionado = btn.textContent.trim();
      // Aplica o filtro e renderiza a tabela
      aplicarFiltros();
    };
  });
}

function filtrarDadosPublicoLocal() {
  aplicarFiltros();
}

function aplicarFiltros() {
  const termoBusca = document.getElementById("buscaPublica").value.toLowerCase();

  // Índice da coluna "Dia da Semana"
  const idxDiaSemana = cabecalhos.findIndex(h => h && h.toLowerCase().includes("dia"));

  let dadosFiltrados = dadosLoja.filter(linha => {
    // Filtrar por busca textual
    const correspondeBusca = linha.some(cel => String(cel).toLowerCase().includes(termoBusca));
    
    if (!correspondeBusca) return false;

    // Filtrar por dia da semana
    if (filtroDiaSelecionado && filtroDiaSelecionado !== "Todos" && idxDiaSemana !== -1) {
      const diaLinha = linha[idxDiaSemana] ? linha[idxDiaSemana].toString().trim() : "";
      return diaLinha.toLowerCase() === filtroDiaSelecionado.toLowerCase();
    }
    return true;
  });

  renderTabelaLoja(dadosFiltrados);
}

function renderTabelaLoja(dados) {
  const tbody = document.querySelector("#tabelaPublica tbody");
  tbody.innerHTML = "";

  // Índice da coluna Telefone
  const idxTelefone = cabecalhos.findIndex(h => h && h.toLowerCase().includes("telefone"));

  dados.forEach(linha => {
    const tr = document.createElement("tr");
    linha.forEach((cel, i) => {
      const td = document.createElement("td");
      if (i === idxTelefone && cel) {
        const telefoneTexto = String(cel).trim();
        const telefoneLimpo = telefoneTexto.replace(/\D/g, "");
        td.innerHTML = `<a href="https://wa.me/${telefoneLimpo}" target="_blank" rel="noopener noreferrer" style="color:#25D366; text-decoration:none;">${telefoneTexto}</a>`;
      } else {
        td.textContent = cel ?? "";
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}
