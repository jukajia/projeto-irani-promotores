google.charts.load('current', { packages: ['corechart', 'table'] });
google.charts.setOnLoadCallback(inicializarLoja);

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

function inicializarLoja() {
  const codigoLoja = new URLSearchParams(window.location.search).get("loja");
  const nomeLoja = mapaLojas[codigoLoja];

  if (!nomeLoja) {
    console.warn("Loja inválida ou não especificada.");
    return;
  }

  document.getElementById("tituloLoja").textContent = `Relatório de Promotores - ${nomeLoja}`;
  configurarFiltrosDia();
  configurarRedimensionamento();
  buscarDados(nomeLoja);
}

function buscarDados(nomeLoja) {
  const query = new google.visualization.Query(window.PLANILHAS.lojas);
  query.send(response => {
    if (response.isError()) {
      console.error("Erro ao buscar dados:", response.getMessage());
      return;
    }

    const tabela = response.getDataTable();
    cabecalhos = Array.from({ length: tabela.getNumberOfColumns() }, (_, i) => tabela.getColumnLabel(i));
    const idxLoja = cabecalhos.findIndex(h => h.toLowerCase().includes("loja"));

    dadosLoja = [];

    for (let r = 0; r < tabela.getNumberOfRows(); r++) {
      if (tabela.getValue(r, idxLoja)?.trim().toLowerCase() !== nomeLoja.toLowerCase()) continue;
      const linha = cabecalhos.map((_, c) => tabela.getValue(r, c));
      dadosLoja.push(linha);
    }

    aplicarFiltros();
  });
}

function configurarFiltrosDia() {
  const botoes = document.querySelectorAll("#filtrosDiasLoja .dia-button");
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
  window.addEventListener("resize", aplicarFiltros);
}

function aplicarFiltros() {
  const busca = document.getElementById("buscaPublica")?.value.toLowerCase() || "";
  const idxDia = 4; // coluna de dias da semana

  const dadosFiltrados = dadosLoja.filter(linha => {
    const correspondeBusca = linha.some(cel => String(cel).toLowerCase().includes(busca));
    if (!correspondeBusca) return false;

    if (filtroDiaSelecionado !== "Todos") {
      const valorDia = (linha[idxDia] ?? "").toString().toLowerCase();
      return valorDia.split(/\s*,\s*/).some(d => d === filtroDiaSelecionado.toLowerCase());
    }

    return true;
  });

  const isMobile = window.innerWidth <= 768;
  isMobile ? renderizarTabelaVertical(dadosFiltrados) : renderizarTabelaHorizontal(dadosFiltrados);
}

function renderizarTabelaHorizontal(dados) {
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

  const idxTelefone = cabecalhos.findIndex(h => h.toLowerCase().includes("telefone"));

  dados.forEach(linha => {
    const tr = document.createElement("tr");
    linha.forEach((cel, i) => {
      const td = document.createElement("td");
      td.setAttribute("data-label", cabecalhos[i]);

      if (i === idxTelefone && cel) {
        const texto = String(cel).trim();
        const limpo = texto.replace(/\D/g, "");
        td.innerHTML = `<a href="https://wa.me/${limpo}" target="_blank" rel="noopener noreferrer" style="color:#25D366;">${texto}</a>`;
      } else {
        td.textContent = cel ?? "";
      }

      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function renderizarTabelaVertical(dados) {
  const tbody = document.querySelector("#tabelaPublica tbody");
  const thead = document.querySelector("#tabelaPublica thead");
  tbody.innerHTML = "";
  thead.innerHTML = "";

  if (dados.length === 0) return;

  const headerRow = document.createElement("tr");
  headerRow.appendChild(document.createElement("th")); // Canto vazio
  dados.forEach((_, i) => {
    const th = document.createElement("th");
    th.textContent = `Promotor ${i + 1}`;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  const idxTelefone = cabecalhos.findIndex(h => h.toLowerCase().includes("telefone"));

  cabecalhos.forEach((rotulo, c) => {
    const tr = document.createElement("tr");

    const th = document.createElement("th");
    th.textContent = rotulo;
    tr.appendChild(th);

    dados.forEach(linha => {
      const td = document.createElement("td");
      td.setAttribute("data-label", rotulo);
      const cel = linha[c];

      if (c === idxTelefone && cel) {
        const texto = String(cel).trim();
        const limpo = texto.replace(/\D/g, "");
        td.innerHTML = `<a href="https://wa.me/${limpo}" target="_blank" rel="noopener noreferrer" style="color:#25D366;">${texto}</a>`;
      } else {
        td.textContent = cel ?? "";
      }

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
}
