// Configuração das colunas (ajustada conforme sua solicitação)
const COLUNAS_PUBLICAS = {
  DIA_SEMANA: 6,    // Coluna "Dias da Semana" (antiga Data/Hora)
  NOME: 2,          // Coluna "Nome"
  MARCA: 3,         // Coluna "Marca"
  PRODUTO: 4,       // Coluna "Produto"
  TELEFONE: 9       // Coluna "Telefone"
};

let dadosPublicos = [];
let diaSelecionado = "Todos";

function atualizarPlanilha() {
  const status = document.getElementById("statusAtualiza");
  status.textContent = "⏳ Carregando...";

  fetch(window.PLANILHA_URL)
    .then(res => res.text())
    .then(text => {
      const json = JSON.parse(text.substring(47).slice(0, -2));
      const rows = json.table.rows;

      dadosPublicos = rows.map(r => ({
        diaSemana: r.c[COLUNAS_PUBLICAS.DIA_SEMANA]?.v || "",
        nome: r.c[COLUNAS_PUBLICAS.NOME]?.v || "",
        marca: r.c[COLUNAS_PUBLICAS.MARCA]?.v || "",
        produto: r.c[COLUNAS_PUBLICAS.PRODUTO]?.v || "",
        telefone: r.c[COLUNAS_PUBLICAS.TELEFONE]?.v || "",
        // Guarda todos os dados originais para possível exportação
        rawData: r.c.map(c => c?.v || "")
      }));

      localStorage.setItem(`dadosPromotores_${window.PLANILHA_URL}`, JSON.stringify({
        data: new Date().getTime(),
        dados: dadosPublicos
      }));

      filtrarDadosPublico();
      status.textContent = "✅ Atualizado!";
      setTimeout(() => status.textContent = "", 2000);
    })
    .catch(err => {
      console.error("Erro ao carregar planilha:", err);
      status.textContent = "❌ Erro ao carregar";
      // Tenta usar dados locais
      const dadosLocais = localStorage.getItem(`dadosPromotores_${window.PLANILHA_URL}`);
      if (dadosLocais) {
        const { data, dados } = JSON.parse(dadosLocais);
        if (new Date().getTime() - data < 3600000) {
          dadosPublicos = dados;
          filtrarDadosPublico();
          status.textContent = "⚠️ Dados locais (última atualização: " + new Date(data).toLocaleTimeString() + ")";
        }
      }
    });
}

function filtrarDia(dia) {
  diaSelecionado = dia;
  filtrarDadosPublico();
}

function filtrarDadosPublico() {
  const termo = document.getElementById("buscaPublica").value.toLowerCase();
  const tabela = document.querySelector("#tabelaPublica tbody");

  const filtrados = dadosPublicos.filter(d => {
    const condDia = diaSelecionado === "Todos" || 
                   d.diaSemana.toLowerCase().includes(diaSelecionado.toLowerCase());
    
    const condTexto = 
      d.nome.toLowerCase().includes(termo) ||
      d.marca.toLowerCase().includes(termo) ||
      d.produto.toLowerCase().includes(termo) ||
      d.telefone.toLowerCase().includes(termo);
    
    return condDia && condTexto;
  });

  tabela.innerHTML = filtrados.map(d => `
    <tr>
      <td>${d.diaSemana}</td>
      <td>${d.nome}</td>
      <td>${d.marca}</td>
      <td>${d.produto}</td>
      <td>${d.telefone}</td>
    </tr>
  `).join("");
}
// Carregar inicialmente
document.addEventListener("DOMContentLoaded", () => {
  // Verificar se há dados locais válidos
  const dadosLocais = localStorage.getItem(`dadosPromotores_${window.PLANILHA_URL}`);
  if (dadosLocais) {
    const { data, dados } = JSON.parse(dadosLocais);
    if (new Date().getTime() - data < 30000) {
      dadosPublicos = dados;
      filtrarDadosPublico();
    }
  }
  atualizarPlanilha();
});
