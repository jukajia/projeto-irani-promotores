const PLANILHA_URL = window.PLANILHAS.gestor;
let dadosGestor = [];
let cabecalhos = [];
let chartDia, chartPromotor;

// Atualiza dados da planilha
async function atualizarPlanilha() {
  const status = document.getElementById("statusAtualiza");
  status.textContent = "⏳ Carregando…";

  try {
    const res = await fetch(`${PLANILHA_URL}&t=${Date.now()}`);
    const text = await res.text();
    const json = JSON.parse(text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*?)\);/)[1]);

    cabecalhos = json.table.cols.map(c => c.label);
    dadosGestor = json.table.rows.map(r => r.c.map(cell => cell?.f ?? cell?.v ?? ""));

    localStorage.setItem("dadosGestor", JSON.stringify({
      data: Date.now(),
      cabecalhos,
      dados: dadosGestor
    }));

    renderizarTudo(dadosGestor);
    status.textContent = "✅ Atualizado!";
  } catch (err) {
    console.error("Erro ao carregar planilha:", err);
    status.textContent = "❌ Erro ao atualizar!";
    usarDadosLocais();
  }
}

function usarDadosLocais() {
  const cache = localStorage.getItem("dadosGestor");
  if (!cache) return;

  const { cabecalhos: cacheCabecalhos, dados } = JSON.parse(cache);
  cabecalhos = cacheCabecalhos;
  dadosGestor = dados;
  renderizarTudo(dadosGestor);
}

function renderizarTudo(dados) {
  renderCabecalho();
  renderTabela(dados);
  gerarGraficos(dados);
}

function renderCabecalho() {
  const head = document.getElementById("cabecalhoGestor");
  head.innerHTML = cabecalhos.map(titulo => `<th>${titulo}</th>`).join("");
}

function renderTabela(dados) {
  const tbody = document.querySelector("#tabelaGestor tbody");
  tbody.innerHTML = "";

  dados.forEach(linha => {
    const tr = document.createElement("tr");

    linha.forEach((cel, idx) => {
      const td = document.createElement("td");

      const titulo = cabecalhos[idx].toLowerCase();
      if (titulo.includes("data")) {
        td.textContent = formatarData(cel);
      } else if (titulo.includes("hora")) {
        td.textContent = formatarHora(cel);
      } else {
        td.textContent = cel;
      }

      tr.appendChild(td);
    });

    tr.onclick = () => {
      document.querySelectorAll("tbody tr").forEach(row => row.classList.remove("destacado"));
      tr.classList.add("destacado");
    };

    tbody.appendChild(tr);
  });
}

function formatarData(valor) {
  const date = new Date(valor);
  return isNaN(date) ? valor : date.toLocaleDateString('pt-BR');
}

function formatarHora(valor) {
  const date = new Date(valor);
  return isNaN(date) ? valor : date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function filtrarDadosGestor() {
  const termo = document.getElementById("buscaGestor").value.toLowerCase();
  const filtrado = dadosGestor.filter(linha => linha.join(" ").toLowerCase().includes(termo));
  renderTabela(filtrado);
  gerarGraficos(filtrado);
}

function gerarGraficos(dados) {
  chartDia?.destroy();
  chartPromotor?.destroy();

  const colDia = cabecalhos.findIndex(c => c.toLowerCase().includes("dia"));
  const colPromotor = cabecalhos.findIndex(c => c.toLowerCase().includes("nome"));

  const contagemDia = contar(dados, colDia);
  const contagemPromotor = contar(dados, colPromotor);

  chartDia = new Chart(document.getElementById("graficoDia"), {
    type: 'line',
    data: {
      labels: Object.keys(contagemDia),
      datasets: [{
        label: "Atendimentos por Dia",
        data: Object.values(contagemDia),
        borderColor: '#00C853',
        backgroundColor: '#00C853',
        fill: false
      }]
    },
    options: chartOptions()
  });

  chartPromotor = new Chart(document.getElementById("graficoPromotor"), {
    type: 'pie',
    data: {
      labels: Object.keys(contagemPromotor),
      datasets: [{
        label: "Atendimentos por Promotor",
        data: Object.values(contagemPromotor),
        backgroundColor: [
          '#00C853', '#29B6F6', '#EF5350', '#FFC107',
          '#AB47BC', '#FF7043', '#26A69A', '#EC407A'
        ]
      }]
    },
    options: chartOptions()
  });
}

function contar(dados, idx) {
  const contagem = {};
  dados.forEach(linha => {
    const chave = linha[idx] || "Não informado";
    contagem[chave] = (contagem[chave] || 0) + 1;
  });
  return contagem;
}

function chartOptions() {
  return {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "#fff",
          font: { family: "Segoe UI" }
        }
      }
    },
    scales: {
      x: { ticks: { color: "#fff" } },
      y: { ticks: { color: "#fff" } }
    }
  };
}

function exportarExcel() {
  const tabela = document.getElementById("tabelaGestor");
  const wb = XLSX.utils.table_to_book(tabela, { sheet: "Relatório" });
  XLSX.writeFile(wb, "Relatorio_Gestor.xlsx");
}

async function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const canvas = await html2canvas(document.getElementById("tabelaGestor"));
  const pdf = new jsPDF('l', 'pt', 'a4');
  const img = canvas.toDataURL("image/png");
  const imgW = pdf.internal.pageSize.getWidth() - 40;
  const imgH = (canvas.height * imgW) / canvas.width;
  pdf.addImage(img, 'PNG', 20, 20, imgW, imgH);
  pdf.save("Relatorio_Gestor.pdf");
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  usarDadosLocais();
  atualizarPlanilha();
  setInterval(atualizarPlanilha, 300_000); // Atualiza a cada 5 min
});
