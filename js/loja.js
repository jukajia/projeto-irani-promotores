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

function renderTabelaVertical(dados) {
  const tabelaContainer = document.getElementById("tabelaPublica");
  tabelaContainer.innerHTML = ""; // Limpa a tabela para recriar com cards

  if (dados.length === 0) return;

  const idxNome = cabecalhos.findIndex(h => h.toLowerCase().includes("nome"));
  const idxMarcas = cabecalhos.findIndex(h => h.toLowerCase().includes("marca"));
  const idxProdutos = cabecalhos.findIndex(h => h.toLowerCase().includes("produto"));
  const idxDias = cabecalhos.findIndex(h => h.toLowerCase().includes("dia"));
  const idxTelefone = cabecalhos.findIndex(h => h.toLowerCase().includes("telefone"));

  dados.forEach(linha => {
    const card = document.createElement("div");
    card.className = "card-promotor";
    card.style.border = "1px solid #444";
    card.style.borderRadius = "12px";
    card.style.padding = "12px";
    card.style.marginBottom = "12px";
    card.style.backgroundColor = "#1a1a1a";

    const formatItem = (emoji, label, valor) => {
      if (!valor) return "";
      const div = document.createElement("div");
      div.style.marginBottom = "6px";
      div.innerHTML = `<strong>${emoji} ${label}:</strong> ${valor}`;
      return div;
    };

    card.appendChild(formatItem("👤", "Nome", linha[idxNome]));
    card.appendChild(formatItem("🏷️", "Marcas", linha[idxMarcas]));
    card.appendChild(formatItem("📦", "Produtos", linha[idxProdutos]));
    card.appendChild(formatItem("📅", "Dias", linha[idxDias]));

    if (linha[idxTelefone]) {
      const telefoneTexto = String(linha[idxTelefone]).trim();
      const telefoneLimpo = telefoneTexto.replace(/\D/g, "");
      const link = document.createElement("div");
      link.innerHTML = `<strong>📱 WhatsApp:</strong> <a href="https://wa.me/${telefoneLimpo}" target="_blank" style="color:#25D366;">${telefoneTexto}</a>`;
      card.appendChild(link);
    }

    tabelaContainer.appendChild(card);
  });
}
