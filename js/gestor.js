let dadosGestor = [];
let cabecalhos = [];
let lojaSelecionada = "Todos";
let diaSelecionado = "Todos";
let charts = {};

function atualizarPlanilha() {
  const status = document.getElementById("statusAtualiza");
  status.textContent = "⏳ Carregando...";

  fetch(window.PLANILHA_URL)
    .then(res => {
      if (!res.ok) throw new Error("Erro na rede");
      return res.text();
    })
    .then(text => {
      const json = JSON.parse(text.substring(47).slice(0, -2));
      cabecalhos = json.table.cols.map(col => col.label);
      dadosGestor = json.table.rows.map(row => row.c.map(cell => cell?.v || ""));

      localStorage.setItem('dadosGestor', JSON.stringify({
        data: new Date().getTime(),
        cabecalhos: cabecalhos,
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
  const dadosLocais = localStorage.getItem('dadosGestor');
  if (dadosLocais) {
    const { data, cabecalhos: cab, dados } = JSON.parse(dadosLocais);
    cabecalhos = cab;
    dadosGestor = dados;
    renderizarInterface();
    document.getElementById("statusAtualiza").textContent = 
      "⚠️ Dados locais (atualizados em " + new Date(data).toLocaleTimeString() + ")";
  }
}

function renderizarInterface() {
  renderCabecalho();
  filtrarDados();
  atualizarGraficos();
  atualizarRankings();
}

function renderCabecalho() {
  const thead = document.getElementById("cabecalhoGestor");
  thead.innerHTML = cabecalhos.map(col => `<th>${col}</th>`).join("");
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
  const colLoja = cabecalhos.findIndex(c => c.toLowerCase().includes("loja"));
  const colDia = cabecalhos.findIndex(c => c.toLowerCase().includes("dia"));

  const dadosFiltrados = dadosGestor.filter(linha => {
    const filtroLoja = lojaSelecionada === "Todos" || 
                      (linha[colLoja]?.toLowerCase().includes(lojaSelecionada.toLowerCase()));
    const filtroDia = diaSelecionado === "Todos" || 
                     (linha[colDia]?.toLowerCase().includes(diaSelecionado.toLowerCase()));
    const filtroTexto = termo === "" || 
                       linha.some(celula => celula.toLowerCase().includes(termo));
    
    return filtroLoja && filtroDia && filtroTexto;
  });

  renderTabela(dadosFiltrados);
  atualizarGraficos(dadosFiltrados);
  atualizarRankings(dadosFiltrados);
}

function renderTabela(dados) {
  const tbody = document.querySelector("#tabelaGestor tbody");
  tbody.innerHTML = dados.map(linha => `
    <tr>
      ${linha.map(celula => `<td>${celula}</td>`).join("")}
    </tr>
  `).join("");
}

function atualizarGraficos(dados = dadosGestor) {
  // Implementação dos gráficos (Chart.js)
  // ... (código dos gráficos conforme anteriormente discutido)
}

function atualizarRankings(dados = dadosGestor) {
  // Implementação dos rankings
  // ... (código dos rankings conforme anteriormente discutido)
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  carregarDadosLocais();
  atualizarPlanilha();
  setInterval(atualizarPlanilha, 300000); // Atualiza a cada 5 minutos
});
console.log("Sistema iniciado com sucesso em:", new Date().toLocaleString());