let dadosGestor = [];
let cabecalhos = [];
let lojaAtual = "Todos";
let diaAtual = "Todos";

function atualizarPlanilha() {
  const status = document.getElementById("statusAtualiza");
  status.textContent = "⏳ Carregando...";

  fetch(window.PLANILHA_URL)
    .then(res => res.text())
    .then(text => {
      const json = JSON.parse(text.substring(47).slice(0, -2));
      cabecalhos = json.table.cols.map(col => col.label);
      dadosGestor = json.table.rows.map(r => r.c.map(c => c?.v || ""));

      localStorage.setItem('dadosGestor', JSON.stringify({
        data: new Date().getTime(),
        cabecalhos: cabecalhos,
        dados: dadosGestor
      }));

      renderCabecalho();
      filtrarDadosGestor();
      status.textContent = "✅ Atualizado!";
      setTimeout(() => status.textContent = "", 2000);
    })
    .catch(err => {
      console.error("Erro ao carregar planilha:", err);
      status.textContent = "❌ Erro ao carregar";
      const dadosLocais = localStorage.getItem('dadosGestor');
      if (dadosLocais) {
        const { data, cabecalhos: cab, dados } = JSON.parse(dadosLocais);
        cabecalhos = cab;
        dadosGestor = dados;
        renderCabecalho();
        filtrarDadosGestor();
      }
    });
}

function filtrarLoja(loja) {
  lojaAtual = loja;
  filtrarDadosGestor();
}

function filtrarDia(dia) {
  diaAtual = dia;
  filtrarDadosGestor();
}

function filtrarDadosGestor() {
  const termo = document.getElementById("buscaGestor").value.toLowerCase();
  const colLoja = cabecalhos.findIndex(c => c.toLowerCase().includes("loja"));
  const colDia = cabecalhos.findIndex(c => c.toLowerCase().includes("dia"));

  const filtrado = dadosGestor.filter(linha => {
    const textoLinha = linha.join(" ").toLowerCase();
    const condTexto = textoLinha.includes(termo);
    const condLoja = lojaAtual === "Todos" || (linha[colLoja]?.includes(lojaAtual));
    const condDia = diaAtual === "Todos" || (linha[colDia]?.toLowerCase().includes(diaAtual.toLowerCase()));
    
    return condTexto && condLoja && condDia;
  });

  renderTabela(filtrado);
}
// Renderizar o cabeçalho da tabela
function renderCabecalho() {
  const head = document.getElementById("cabecalhoGestor");
  head.innerHTML = cabecalhos.map(c => `<th>${c}</th>`).join("");
}

// Renderizar as linhas da tabela
function renderTabela(dados) {
  const tbody = document.querySelector("#tabelaGestor tbody");
  tbody.innerHTML = "";

  dados.forEach(linha => {
    const tr = document.createElement("tr");
    linha.forEach(cel => {
      const td = document.createElement("td");
      td.textContent = cel;
      tr.appendChild(td);
    });

    tr.onclick = () => {
      document.querySelectorAll("tbody tr").forEach(row => row.classList.remove("destacado"));
      tr.classList.add("destacado");
    };

    tbody.appendChild(tr);
  });
}

// Filtro por loja
function filtrarLoja(loja) {
  lojaAtual = loja;
  filtrarDadosGestor();
}

// Filtro geral (loja + busca texto)
function filtrarDadosGestor() {
  const termo = document.getElementById("buscaGestor").value.toLowerCase();
  const colLoja = cabecalhos.findIndex(c => c.toLowerCase().includes("loja"));

  const filtrado = dadosGestor.filter(linha => {
    const textoLinha = linha.join(" ").toLowerCase();
    const condTexto = textoLinha.includes(termo);
    const condLoja = lojaAtual === "Todos" || (linha[colLoja]?.includes(lojaAtual));
    return condTexto && condLoja;
  });

  renderTabela(filtrado);
  gerarGraficos(filtrado);
  gerarRanking(filtrado);
}

// Gerar gráficos dinâmicos
function gerarGraficos(dados) {
  const contagemLoja = {};
  const contagemDia = {};
  const contagemPromotor = {};

  const colLoja = cabecalhos.findIndex(c => c.toLowerCase().includes("loja"));
  const colDia = cabecalhos.findIndex(c => c.toLowerCase().includes("dia"));
  const colPromotor = cabecalhos.findIndex(c => c.toLowerCase().includes("nome"));

  dados.forEach(linha => {
    const loja = linha[colLoja] || "";
    const dia = linha[colDia] || "";
    const promotor = linha[colPromotor] || "";

    contagemLoja[loja] = (contagemLoja[loja] || 0) + 1;
    contagemDia[dia] = (contagemDia[dia] || 0) + 1;
    contagemPromotor[promotor] = (contagemPromotor[promotor] || 0) + 1;
  });

  // Destruir gráficos existentes
  if (chartLoja) chartLoja.destroy();
  if (chartDia) chartDia.destroy();
  if (chartPromotor) chartPromotor.destroy();

  // Gráfico de atendimentos por loja
  chartLoja = new Chart(document.getElementById('graficoLoja'), {
    type: 'bar',
    data: {
      labels: Object.keys(contagemLoja),
      datasets: [{
        label: 'Atendimentos por Loja',
        data: Object.values(contagemLoja),
        backgroundColor: '#00C853'
      }]
    },
    options: {
      responsive: true,
      plugins: { 
        legend: { 
          labels: { 
            color: '#fff',
            font: {
              family: "'Ubuntu', sans-serif"
            }
          } 
        } 
      },
      scales: { 
        x: { 
          ticks: { 
            color: '#fff',
            font: {
              family: "'Ubuntu', sans-serif"
            }
          } 
        }, 
        y: { 
          ticks: { 
            color: '#fff',
            font: {
              family: "'Ubuntu', sans-serif"
            }
          } 
        } 
      }
    }
  });

  // Gráfico de atendimentos por dia
  chartDia = new Chart(document.getElementById('graficoDia'), {
    type: 'line',
    data: {
      labels: Object.keys(contagemDia),
      datasets: [{
        label: 'Atendimentos por Dia',
        data: Object.values(contagemDia),
        borderColor: '#EF5350',
        backgroundColor: '#EF5350',
        fill: false
      }]
    },
    options: {
      responsive: true,
      plugins: { 
        legend: { 
          labels: { 
            color: '#fff',
            font: {
              family: "'Ubuntu', sans-serif"
            }
          } 
        } 
      },
      scales: { 
        x: { 
          ticks: { 
            color: '#fff',
            font: {
              family: "'Ubuntu', sans-serif"
            }
          } 
        }, 
        y: { 
          ticks: { 
            color: '#fff',
            font: {
              family: "'Ubuntu', sans-serif"
            }
          } 
        } 
      }
    }
  });

  // Gráfico de atendimentos por promotor
  chartPromotor = new Chart(document.getElementById('graficoPromotor'), {
    type: 'pie',
    data: {
      labels: Object.keys(contagemPromotor),
      datasets: [{
        label: 'Atendimentos por Promotor',
        data: Object.values(contagemPromotor),
        backgroundColor: [
          '#00C853', '#EF5350', '#FFC107', '#29B6F6', 
          '#AB47BC', '#FF7043', '#26A69A', '#EC407A'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: { 
        legend: { 
          labels: { 
            color: '#fff',
            font: {
              family: "'Ubuntu', sans-serif"
            }
          } 
        } 
      }
    }
  });
}

// Gerar ranking de promotores
function gerarRanking(dados) {
  const contagemMarca = {};
  const contagemLojas = {};
  const promotores = {};

  const colPromotor = cabecalhos.findIndex(c => c.toLowerCase().includes("nome"));
  const colMarca = cabecalhos.findIndex(c => c.toLowerCase().includes("marca"));
  const colLoja = cabecalhos.findIndex(c => c.toLowerCase().includes("loja"));

  dados.forEach(linha => {
    const promotor = linha[colPromotor] || "Desconhecido";
    const marca = linha[colMarca] || "Desconhecida";
    const loja = linha[colLoja] || "Desconhecida";

    // Contagem por marca
    if (!contagemMarca[marca]) contagemMarca[marca] = 0;
    contagemMarca[marca]++;

    // Contagem por promotor (cobertura de lojas)
    if (!promotores[promotor]) promotores[promotor] = new Set();
    promotores[promotor].add(loja);
  });

  // Converter Set para contagem
  Object.keys(promotores).forEach(promotor => {
    contagemLojas[promotor] = promotores[promotor].size;
  });

  // Top marcas
  const topMarcas = Object.entries(contagemMarca)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Top cobertura
  const topCobertura = Object.entries(contagemLojas)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Atualizar HTML
  const listaMarcas = document.getElementById("topMarcas");
  listaMarcas.innerHTML = topMarcas.map(([marca, qtd], i) => 
    `<li>${i+1}º ${marca} - ${qtd} atendimentos</li>`
  ).join("");

  const listaCobertura = document.getElementById("topCobertura");
  listaCobertura.innerHTML = topCobertura.map(([promotor, qtd], i) => 
    `<li>${i+1}º ${promotor} - ${qtd} lojas</li>`
  ).join("");
}

// Botões de exportação
function exportarExcel() {
  const tabela = document.getElementById('tabelaGestor');
  const wb = XLSX.utils.table_to_book(tabela, { sheet: "Relatório" });
  XLSX.writeFile(wb, "Relatorio_Gestor.xlsx");
}

function exportarCSV() {
  const tabela = document.getElementById('tabelaGestor');
  const wb = XLSX.utils.table_to_book(tabela, { sheet: "Relatório" });
  XLSX.writeFile(wb, "Relatorio_Gestor.csv");
}

async function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const tabela = document.getElementById('tabelaGestor');

  const canvas = await html2canvas(tabela, { scale: 2 });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('l', 'pt', 'a4');

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth - 40;
  const imgHeight = canvas.height * imgWidth / canvas.width;

  pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
  pdf.save("Relatorio_Gestor.pdf");
}

// Carregar inicialmente
document.addEventListener("DOMContentLoaded", () => {
  // Verificar se há dados locais válidos
  const dadosLocais = localStorage.getItem('dadosGestor');
  if (dadosLocais) {
    const { data, cabecalhos: cab, dados } = JSON.parse(dadosLocais);
    cabecalhos = cab;
    dadosGestor = dados;
    renderCabecalho();
    renderTabela(dadosGestor);
    gerarGraficos(dadosGestor);
    gerarRanking(dadosGestor);
  }
  atualizarPlanilha();
  
  // Atualizar automaticamente a cada 5 minutos
  setInterval(atualizarPlanilha, 300000);
});