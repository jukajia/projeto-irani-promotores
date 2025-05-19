// Carrega os pacotes do Google Charts necessários para leitura da planilha
google.charts.load('current', { packages: ['corechart', 'table'] });
google.charts.setOnLoadCallback(carregarLoja); // Executa a função principal ao carregar

// Variáveis globais que armazenam dados
let dadosLoja = [];        // Armazena os dados filtrados da loja selecionada
let cabecalhos = [];       // Nomes das colunas da planilha
let filtroDiaSelecionado = "Todos"; // Valor atual do filtro de dia da semana

// Dicionário com os códigos das lojas e seus nomes correspondentes
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

// Função principal que carrega os dados da loja selecionada pela URL
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

    // Armazena os nomes das colunas (cabecalhos)
    for (let c = 0; c < dataTable.getNumberOfColumns(); c++) {
      cabecalhos.push(dataTable.getColumnLabel(c));
    }

    // Localiza a coluna que contém o nome da loja
    const idxLoja = cabecalhos.findIndex(h => h && h.toLowerCase().includes("loja"));
    if (idxLoja === -1) {
      console.error("Coluna 'Loja' não encontrada.");
      return;
    }

    // Filtra somente os dados da loja selecionada
    for (let r = 0; r < dataTable.getNumberOfRows(); r++) {
      const lojaNaLinha = dataTable.getValue(r, idxLoja);
      if (String(lojaNaLinha).trim().toLowerCase() !== nomeLoja.trim().toLowerCase()) continue;

      const linha = [];
      for (let c = 0; c < dataTable.getNumberOfColumns(); c++) {
        linha.push(dataTable.getValue(r, c));
      }
      dadosLoja.push(linha);
    }

    aplicarFiltros(); // Exibe os dados filtrados
  });

  configurarFiltrosDia(); // Ativa os botões de filtro de dia
}

// Associa os botões dos dias da semana aos filtros
function configurarFiltrosDia() {
  const containerFiltros = document.getElementById("filtrosDiasLoja");
  if (!containerFiltros) return;

  const botoes = containerFiltros.querySelectorAll(".dia-button");

  botoes.forEach(btn => {
    btn.onclick = () => {
      // Remove a seleção anterior
      botoes.forEach(b => b.classList.remove("selected"));
      // Marca o botão atual como selecionado
      btn.classList.add("selected");
      // Atualiza a variável de filtro com o valor do botão
      filtroDiaSelecionado = btn.textContent.trim();
      // Aplica os filtros com base no novo dia selecionado
      aplicarFiltros();
    };
  });
}

// Aplica filtros com base no texto digitado e no dia da semana selecionado
function filtrarDadosPublicoLocal() {
  aplicarFiltros();
}

// Filtra os dados conforme a busca e o dia da semana (pode conter múltiplos dias)
function aplicarFiltros() {
  const termoBusca = document.getElementById("buscaPublica").value.toLowerCase();

  const idxDiaSemana = 3; // Índice fixo da coluna "Dia da Semana" (4ª coluna = índice 3)

  let dadosFiltrados = dadosLoja.filter(linha => {
    // Filtro por busca textual
    const correspondeBusca = linha.some(cel => String(cel).toLowerCase().includes(termoBusca));
    if (!correspondeBusca) return false;

    // Filtro por dia da semana (mesmo que tenha vários dias na célula)
    if (filtroDiaSelecionado && filtroDiaSelecionado !== "Todos") {
      const diasNaLinha = linha[idxDiaSemana] ? linha[idxDiaSemana].toString().toLowerCase() : "";
      const diasArray = diasNaLinha.split(",").map(d => d.trim()); // ex: ["segunda", "terça"]
      return diasArray.includes(filtroDiaSelecionado.toLowerCase());
    }

    return true;
  });

  renderTabelaLoja(dadosFiltrados);
}

// Renderiza a tabela com os dados filtrados no DOM
function renderTabelaLoja(dados) {
  const tbody = document.querySelector("#tabelaPublica tbody");
  const thead = document.querySelector("#tabelaPublica thead");
  
  // Limpa conteúdo atual
  tbody.innerHTML = "";
  thead.innerHTML = "";

  if (dados.length === 0) return;

  // Cria o cabeçalho com uma célula vazia + uma para cada pessoa
  const headerRow = document.createElement("tr");
  headerRow.appendChild(document.createElement("th")); // célula vazia no canto
  for (let i = 0; i < dados.length; i++) {
    const th = document.createElement("th");
    th.textContent = `Promotor ${i + 1}`;
    headerRow.appendChild(th);
  }
  thead.appendChild(headerRow);

  // Índice da coluna de telefone (para link do WhatsApp)
  const idxTelefone = cabecalhos.findIndex(h => h && h.toLowerCase().includes("telefone"));

  // Para cada campo (Nome, Marca, etc)
  for (let c = 0; c < cabecalhos.length; c++) {
    const tr = document.createElement("tr");

    // Nome do campo na primeira coluna
    const th = document.createElement("th");
    th.textContent = cabecalhos[c];
    tr.appendChild(th);

    // Dados de cada promotor nessa linha
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
