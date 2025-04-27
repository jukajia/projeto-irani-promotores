// Configuração das colunas
const COLUNAS = {
  DIA_SEMANA: 6,    // Coluna 6 - Dias da Semana
  NOME: 2,          // Coluna 2 - Nome
  MARCA: 3,         // Coluna 3 - Marca
  PRODUTO: 4,       // Coluna 4 - Produto
  TELEFONE: 9       // Coluna 9 - Telefone
};

let dadosPublicos = [];
let diaSelecionado = "Todos";

function atualizarPlanilha() {
  const status = document.getElementById("statusAtualiza");
  status.textContent = "⏳ Carregando...";

  fetch(window.PLANILHA_URL)
    .then(res => {
      if (!res.ok) throw new Error("Erro na rede");
      return res.text();
    })
    .then(text => {
      try {
        const json = JSON.parse(text.substring(47).slice(0, -2));
        dadosPublicos = json.table.rows.map(row => ({
          diaSemana: row.c[COLUNAS.DIA_SEMANA]?.v || "",
          nome: row.c[COLUNAS.NOME]?.v || "",
          marca: row.c[COLUNAS.MARCA]?.v || "",
          produto: row.c[COLUNAS.PRODUTO]?.v || "",
          telefone: row.c[COLUNAS.TELEFONE]?.v || ""
        }));

        localStorage.setItem(`dadosPromotores_${window.PLANILHA_URL}`, JSON.stringify({
          data: new Date().getTime(),
          dados: dadosPublicos
        }));

        filtrarDadosPublico();
        status.textContent = "✅ Atualizado!";
      } catch (e) {
        throw new Error("Erro ao processar dados");
      }
    })
    .catch(err => {
      console.error("Erro:", err);
      status.textContent = "❌ Erro ao carregar";
      carregarDadosLocais();
    });
}

function carregarDadosLocais() {
  const dadosLocais = localStorage.getItem(`dadosPromotores_${window.PLANILHA_URL}`);
  if (dadosLocais) {
    const { data, dados } = JSON.parse(dadosLocais);
    if (new Date().getTime() - data < 3600000) { // 1 hora de cache
      dadosPublicos = dados;
      filtrarDadosPublico();
      document.getElementById("statusAtualiza").textContent = 
        "⚠️ Dados locais (atualizados em " + new Date(data).toLocaleTimeString() + ")";
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
    const diaOK = diaSelecionado === "Todos" || 
                 item.diaSemana.toLowerCase().includes(diaSelecionado.toLowerCase());
    const textoOK = termo === "" || 
                   Object.values(item).some(val => val.toLowerCase().includes(termo));
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
  `).join("");
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  carregarDadosLocais();
  atualizarPlanilha();
  setInterval(atualizarPlanilha, 300000); // Atualiza a cada 5 minutos
});