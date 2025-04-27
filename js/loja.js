// loja.js (corrigido)
const COLUNAS = {
  DIA_SEMANA: 6,
  NOME: 2,
  MARCA: 3,
  PRODUTO: 4,
  TELEFONE: 9
};
let dadosPublicos = [];
let diaSelecionado = "Todos";

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
    .then(async res => {
      if (!res.ok) {
        const errorBody = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} - ${errorBody || 'Sem detalhes'}`);
      }
      return res.text();
    })
    .then(text => {
      const json = extractJSONFromGviz(text);
      dadosPublicos = json.table.rows.map(row => ({
        diaSemana: row.c[COLUNAS.DIA_SEMANA]?.v || "",
        nome:      row.c[COLUNAS.NOME]?.v      || "",
        marca:     row.c[COLUNAS.MARCA]?.v     || "",
        produto:   row.c[COLUNAS.PRODUTO]?.v   || "",
        telefone:  row.c[COLUNAS.TELEFONE]?.v  || ""
      }));

      localStorage.setItem(
        `dadosPromotores_${window.PLANILHA_URL}`,
        JSON.stringify({ data: Date.now(), dados: dadosPublicos })
      );

      filtrarDadosPublico();
      status.textContent = "✅ Atualizado!";
    })
    .catch(err => {
      console.error("Erro completo:", err);
      status.textContent = "❌ Erro ao carregar";
      status.title = err.message;
      carregarDadosLocais();
    });
}

function carregarDadosLocais() {
  const key = `dadosPromotores_${window.PLANILHA_URL}`;
  const dadosLocais = localStorage.getItem(key);
  if (dadosLocais) {
    const { data, dados } = JSON.parse(dadosLocais);
    if (Date.now() - data < 3600000) {
      dadosPublicos = dados;
      filtrarDadosPublico();
      document.getElementById("statusAtualiza").textContent = 
        `⚠️ Dados locais (atualizados em ${new Date(data).toLocaleTimeString()})`;
    }
  }
}

function filtrarDia(dia) {
  diaSelecionado = dia;
  filtrarDadosPublico();
}

function filtrarDadosPublico() {
  const termo = document.getElementById("buscaPublica").value.toLowerCase();
  const tabela = document.querySelector("#tabelaPublica tbody");

  const filtrados = dadosPublicos.filter(item => {
    const diaOK   = diaSelecionado === "Todos" || item.diaSemana.toLowerCase().includes(diaSelecionado.toLowerCase());
    const textoOK = termo === "" || Object.values(item).some(val => val.toLowerCase().includes(termo));
    return diaOK && textoOK;
  });

  tabela.innerHTML = filtrados.map(item => `
    <tr>
      <td>${item.diaSemana}</td>
      <td>${item.nome}</td>
      <td>${item.marca}</td>
      <td>${item.produto}</td>
      <td>${item.telefone}</td>
    </tr>
  `).join('');
}

document.addEventListener("DOMContentLoaded", () => {
  carregarDadosLocais();
  atualizarPlanilha();
  setInterval(atualizarPlanilha, 300000);
});
