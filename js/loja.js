let dadosPublicos = [];
let diaSelecionado = "Todos";

// Buscar os dados
function atualizarPlanilha() {
  const status = document.getElementById("statusAtualiza");
  status.textContent = "⏳ Carregando...";

  fetch(window.PLANILHA_URL)
    .then(res => res.text())
    .then(text => {
      const json = JSON.parse(text.substring(47).slice(0, -2));
      const rows = json.table.rows;

      dadosPublicos = rows.map(r => ({
        dataHora: r.c[0]?.f || "",
        nome: r.c[2]?.v || "",
        marca: r.c[6]?.v || "",
        produto: r.c[7]?.v || "",
        telefone: r.c[5]?.v || "",
        diaSemana: r.c[8]?.v || ""
      }));

      // Armazenar localmente com timestamp (válido por 1 hora)
      localStorage.setItem(`dadosPromotores_${window.PLANILHA_URL}`, JSON.stringify({
        data: new Date().getTime(),
        dados: dadosPublicos
      }));

      filtrarDadosPublico();
      status.textContent = "✅ Atualizado!";
      setTimeout(() => status.textContent = "", 2000);
    })
    .catch(() => {
      status.textContent = "❌ Erro ao carregar";
      // Tentar usar dados locais se houver
      const dadosLocais = localStorage.getItem(`dadosPromotores_${window.PLANILHA_URL}`);
      if (dadosLocais) {
        const { data, dados } = JSON.parse(dadosLocais);
        // Usar dados locais apenas se tiverem menos de 1 hora
        if (new Date().getTime() - data < 3600000) {
          dadosPublicos = dados;
          filtrarDadosPublico();
          status.textContent = "⚠️ Dados locais (última atualização: " + 
            new Date(data).toLocaleTimeString() + ")";
        }
      }
    });
}

// Filtrar por dia da semana
function filtrarDia(dia) {
  diaSelecionado = dia;
  filtrarDadosPublico();
}

// Filtrar geral
function filtrarDadosPublico() {
  const termo = document.getElementById("buscaPublica").value.toLowerCase();
  const tabela = document.querySelector("#tabelaPublica tbody");

  const filtrados = dadosPublicos.filter(d => {
    const condDia = diaSelecionado === "Todos" || d.diaSemana === diaSelecionado;
    const condTexto = 
      d.nome.toLowerCase().includes(termo) ||
      d.marca.toLowerCase().includes(termo) ||
      d.produto.toLowerCase().includes(termo) ||
      d.telefone.toLowerCase().includes(termo);
    return condDia && condTexto;
  });

  tabela.innerHTML = "";

  filtrados.forEach(d => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${d.dataHora}</td>
      <td>${d.nome}</td>
      <td>${d.marca}</td>
      <td>${d.produto}</td>
      <td>${d.telefone}</td>
    `;
    tabela.appendChild(tr);
  });
}

// Carregar inicialmente
document.addEventListener("DOMContentLoaded", () => {
  // Verificar se há dados locais válidos
  const dadosLocais = localStorage.getItem(`dadosPromotores_${window.PLANILHA_URL}`);
  if (dadosLocais) {
    const { data, dados } = JSON.parse(dadosLocais);
    if (new Date().getTime() - data < 3600000) {
      dadosPublicos = dados;
      filtrarDadosPublico();
    }
  }
  atualizarPlanilha();
});