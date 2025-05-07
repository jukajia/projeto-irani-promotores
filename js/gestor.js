let dadosGestor = [];
let cabecalhos = [];
let lojaAtual = "Todos";
let chartLoja, chartDia, chartPromotor;

// URL da planilha com a aba Gestor
const PLANILHA_GESTOR_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQU9GiNO40jd-ZQkU_vzLRfxYhf5kdpZL_BoLmbok9DjLzqYAqHfObnp4MPs2V_HN9ZbWBb4kCHQKfh/pub?gid=0&single=true&output=json';

async function atualizarPlanilha() {
  const status = document.getElementById("statusAtualiza");
  status.textContent = "⏳ Carregando…";
  status.style.color = "#FFC107";

  try {
    const res = await fetch(`${PLANILHA_GESTOR_URL}&t=${Date.now()}`);
    if (!res.ok) throw new Error(`Erro HTTP: ${res.status} ${res.statusText}`);

    const data = await res.json();
    if (!data || !data.feed || !data.feed.entry) {
      throw new Error("Formato de resposta inválido");
    }

    // Processar dados da planilha
    const rows = data.feed.entry;
    cabecalhos = Object.keys(rows[0])
      .filter(key => key.startsWith('gsx$'))
      .map(key => key.replace('gsx$', ''));
    
    dadosGestor = rows.map(row => {
      return cabecalhos.map(header => row[`gsx$${header}`]?.$t || "");
    });

    localStorage.setItem("dadosGestor", JSON.stringify({
      data: Date.now(),
      cabecalhos,
      dados: dadosGestor
    }));

    renderizarTudo(dadosGestor);
    status.textContent = "✅ Atualizado!";
    status.style.color = "#00C853";
    setTimeout(() => status.textContent = "", 2000);

  } catch (error) {
    console.error("Erro ao carregar planilha:", error);
    status.textContent = `❌ Erro: ${error.message}`;
    status.style.color = "#EF5350";
    usarDadosLocais();
  }
}

// ... (mantenha as outras funções como renderizarTudo, renderCabecalho, etc)
