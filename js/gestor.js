// gestor.js (corrigido)
let dadosGestor = [];
let cabecalhos = [];
let lojaSelecionada = "Todos";
let diaSelecionado = "Todos";
let charts = {};

function extractJSONFromGviz(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}') + 1;
  const jsonText = text.substring(start, end);
  return JSON.parse(jsonText);
}

function atualizarPlanilha() {
  const status = document.getElementById("statusAtualiza");
  status.textContent = "⏳ Carregando...";

  fetch(window.PLANILHA_URL)
    .then(res => {
      if (!res.ok) throw new Error("Erro na rede");
      return res.text();
    })
    .then(text => {
      const json = extractJSONFromGviz(text);
      cabecalhos = json.table.cols.map(col => col.label);
      dadosGestor = json.table.rows.map(row => row.c.map(cell => cell?.v || ""));

      localStorage.setItem('dadosGestor', JSON.stringify({
        data: Date.now(),
        cabecalhos,
        dados: dadosGestor
      }));

      renderizarInterface();
      status.textContent = "✅ Atualizado!";
    })
    .catch(err => {
      console.error("Erro:", err);
      status.textContent = "❌ Erro ao carregar";
      carregarDadosLocais();
    });
}

function carregarDadosLocais() {
  const stored = localStorage.getItem('dadosGestor');
  if (stored) {
    const { data, cabecalhos: cab, dados } = JSON.parse(stored);
    cabecalhos = cab;
    dadosGestor = dados;
    renderizarInterface();
    document.getElementById("statusAtualiza").textContent = 
      `⚠️ Dados locais (atualizados em ${new Date(data).toLocaleTimeString()})`;
  }
}

function renderizarInterface() {
  renderCabecalho();
  filtrarDados();
  atualizarGraficos();
  atualizarRankings();
}

function renderCabecalho() {
  document.getElementById("cabecalhoGestor").innerHTML =
    cabecalhos.map(col => `<th>${col}</th>`).join("");
}

function filtrarPorLoja(loja) {
  lojaSelecionada = loja;
  filtrarDados();
}

function filtrarPorDia(dia) {
  diaSelecionado = dia;
  filtrarDados();
}

function filtrarDados() {
  const termo = document.getElementById("buscaGestor").value.toLowerCase();
  const colLoja = cabecalhos.findIndex(c => /(loja|código da loja)/i.test(c));
  const colDia  = cabecalhos.findIndex(c => /(dia|data\/hora)/i.test(c));

  if (colLoja < 0 || colDia < 0) {
    console.warn("Coluna Loja ou Dia não encontrada. Verifique cabeçalhos.", { cabecalhos });
  }

  const dadosFiltrados = dadosGestor.filter(linha => {
    const lojaVal = (linha[colLoja] || "").toLowerCase();
    const diaVal  = (linha[colDia]  || "").toLowerCase();
    const filtroLoja = lojaSelecionada === "Todos" || lojaVal.includes(lojaSelecionada.toLowerCase());
    const filtroDia  = diaSelecionado === "Todos" || diaVal.includes(diaSelecionado.toLowerCase());
    const filtroTxt  = termo === ""       || linha.some(c => (c || "").toString().toLowerCase().includes(termo));
    return filtroLoja && filtroDia && filtroTxt;
  });

  renderTabela(dadosFiltrados);
  atualizarGraficos(dadosFiltrados);
  atualizarRankings(dadosFiltrados);
}

function renderTabela(dados) {
  const tbody = document.querySelector("#tabelaGestor tbody");
  tbody.innerHTML = dados.map(linha => `
    <tr>
      ${linha.map(c => `<td>${c}</td>`).join('')}
    </tr>
  `).join('');
}

function atualizarGraficos(dados = dadosGestor) {
  // ... implementação dos gráficos (Chart.js) permanece a mesma
}

function atualizarRankings(dados = dadosGestor) {
  // ... implementação dos rankings permanece a mesma
}

document.addEventListener("DOMContentLoaded", () => {
  carregarDadosLocais();
  atualizarPlanilha();
  setInterval(atualizarPlanilha, 300000);
  console.log("Sistema iniciado com sucesso em:", new Date().toLocaleString());
});
