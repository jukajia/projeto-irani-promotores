google.charts.load('current', { packages: ['corechart', 'table'] });
google.charts.setOnLoadCallback(atualizarPlanilha);

let dadosOriginais = [];

document.addEventListener("DOMContentLoaded", async () => {
  await carregarDados();
  configurarFiltros();
});

async function carregarDados() {
  try {
    const resposta = await fetch(PLANILHA_GESTOR_URL);
    const dados = await resposta.json();
    dadosOriginais = dados;
    preencherTabela(dados);
    gerarTodosGraficos(dados);
  } catch (erro) {
    console.error("Erro ao carregar dados:", erro);
  }
}

// 🧠 Filtros
function configurarFiltros() {
  document.querySelectorAll(".loja-button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".loja-button").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      aplicarFiltros();
    });
  });

  document.getElementById("buscaGestor").addEventListener("input", aplicarFiltros);
}

function aplicarFiltros() {
  const lojaSelecionada = document.querySelector(".loja-button.selected")?.textContent.trim();
  const termoBusca = document.getElementById("buscaGestor").value.trim().toLowerCase();

  const filtrados = dadosOriginais.filter(d => {
    const correspondeBusca =
      d.nome?.toLowerCase().includes(termoBusca) ||
      d.funcao?.toLowerCase().includes(termoBusca) ||
      d.loja?.toLowerCase().includes(termoBusca);

    const correspondeLoja = lojaSelecionada === "Todas" || d.loja === lojaSelecionada;

    return correspondeBusca && correspondeLoja;
  });

  preencherTabela(filtrados);
  gerarTodosGraficos(filtrados);
}

// 🧾 Tabela
function preencherTabela(dados) {
  const cabecalho = document.getElementById("cabecalhoGestor");
  const corpo = document.querySelector("#tabelaGestor tbody");
  cabecalho.innerHTML = "";
  corpo.innerHTML = "";

  if (dados.length === 0) {
    corpo.innerHTML = "<tr><td colspan='100%'>Nenhum dado encontrado.</td></tr>";
    return;
  }

  Object.keys(dados[0]).forEach(coluna => {
    cabecalho.innerHTML += `<th>${coluna}</th>`;
  });

  dados.forEach(item => {
    const linha = document.createElement("tr");
    Object.values(item).forEach(valor => {
      const td = document.createElement("td");
      td.textContent = valor;
      linha.appendChild(td);
    });
    corpo.appendChild(linha);
  });
}

// 📊 Gráficos
function gerarTodosGraficos(dados) {
  gerarGraficoDiasPorPromotor(dados);
  gerarGraficoPromotoresPorLoja(dados);
  gerarGraficoDistribuicaoPorDia(dados);
  gerarRankingTop10(dados);
}

// Gráfico 1: Dias da semana por promotor
function gerarGraficoDiasPorPromotor(dados) {
  const mapa = {};

  dados.forEach(d => {
    const nome = d.nome?.trim();
    const dias = d.dias?.split(",").map(dia => dia.trim());

    if (nome && dias) {
      mapa[nome] = (mapa[nome] || 0) + dias.length;
    }
  });

  const nomes = Object.keys(mapa);
  const totais = Object.values(mapa);

  desenharGraficoBarras("graficoPromotorDias", nomes, totais, "Dias na Semana");
}

// Gráfico 2: Promotores únicos por loja
function gerarGraficoPromotoresPorLoja(dados) {
  const mapaPromotorLojas = new Map();

  dados.forEach(registro => {
    const nome = registro.nome?.trim();
    const loja = registro.loja?.trim();

    if (nome && loja) {
      if (!mapaPromotorLojas.has(nome)) {
        mapaPromotorLojas.set(nome, new Set());
      }
      mapaPromotorLojas.get(nome).add(loja);
    }
  });

  const contagemLojas = {};
  mapaPromotorLojas.forEach(lojas => {
    lojas.forEach(loja => {
      contagemLojas[loja] = (contagemLojas[loja] || 0) + 1;
    });
  });

  const lojas = Object.keys(contagemLojas);
  const totais = Object.values(contagemLojas);

  desenharGraficoBarras("graficoPromotoresPorLoja", lojas, totais, "Promotores");
}

// Gráfico 3: Dias da semana totais
function gerarGraficoDistribuicaoPorDia(dados) {
  const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
  const contagem = Object.fromEntries(diasSemana.map(d => [d, 0]));

  dados.forEach(d => {
    const dias = d.dias?.split(",").map(dia => dia.trim());
    dias?.forEach(dia => {
      if (contagem[dia] !== undefined) {
        contagem[dia]++;
      }
    });
  });

  const labels = diasSemana;
  const valores = diasSemana.map(d => contagem[d]);

  desenharGraficoBarras("graficoDiasSemana", labels, valores, "Atendimentos");
}

// Gráfico 4: Top 10 promotores
function gerarRankingTop10(dados) {
  const mapa = {};

  dados.forEach(d => {
    const nome = d.nome?.trim();
    const dias = d.dias?.split(",").map(dia => dia.trim());

    if (nome && dias) {
      mapa[nome] = (mapa[nome] || 0) + dias.length;
    }
  });

  const ranking = Object.entries(mapa)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const ol = document.getElementById("rankingPromotores");
  ol.innerHTML = "";

  ranking.forEach(([nome, total]) => {
    const li = document.createElement("li");
    li.textContent = `${nome} — ${total} dias`;
    ol.appendChild(li);
  });
}

// 🎨 Utilitário para renderizar gráficos com Chart.js
function desenharGraficoBarras(idCanvas, labels, valores, labelDataset) {
  const ctx = document.getElementById(idCanvas).getContext("2d");

  if (window[idCanvas]) window[idCanvas].destroy(); // evita sobreposição

  window[idCanvas] = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: labelDataset,
        data: valores,
        backgroundColor: "#1f7135",
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: { ticks: { color: "#fff" } },
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, color: "#fff" },
        },
      },
    },
  });
}

// 📤 Exportações (Excel/PDF)
function exportarExcel() {
  const tabela = document.getElementById("tabelaGestor");
  const wb = XLSX.utils.table_to_book(tabela, { sheet: "Relatório" });
  XLSX.writeFile(wb, "relatorio.xlsx");
}

function exportarPDF() {
  const tabela = document.getElementById("tabelaGestor");
  html2canvas(tabela).then(canvas => {
    const pdf = new jspdf.jsPDF();
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
    pdf.save("relatorio.pdf");
  });
}

function atualizarPlanilha() {
  document.getElementById("statusAtualiza").textContent = "🔄 Atualizando...";
  carregarDados().then(() => {
    document.getElementById("statusAtualiza").textContent = "✅ Atualizado!";
    setTimeout(() => {
      document.getElementById("statusAtualiza").textContent = "";
    }, 3000);
  });
}
