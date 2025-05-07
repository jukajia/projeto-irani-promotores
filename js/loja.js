const PLANILHA_LOJAS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQU9GiNO40jd-ZQkU_vzLRfxYhf5kdpZL_BoLmbok9DjLzqYAqHfObnp4MPs2V_HN9ZbWBb4kCHQKfh/pub?gid=XXXXXX&single=true&output=json';

async function atualizarPlanilha() {
  const status = document.getElementById("statusAtualiza");
  status.textContent = "⏳ Carregando...";
  status.style.color = "#FFC107";

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const codigoLoja = urlParams.get('loja');

    if (!codigoLoja || !window.LOJAS[codigoLoja]) {
      throw new Error("Loja não configurada ou código inválido.");
    }

    const response = await fetch(`${PLANILHA_LOJAS_URL.replace('XXXXXX', '123456')}&t=${Date.now()}`);
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

    const data = await response.json();
    if (!data?.feed?.entry) throw new Error("Dados da planilha indisponíveis.");

    const rows = data.feed.entry;
    const cabecalhos = Object.keys(rows[0])
      .filter(key => key.startsWith('gsx$'))
      .map(key => key.replace('gsx$', ''));
    
    const dadosPublicos = rows.map(row => {
      return cabecalhos.map(header => row[`gsx$${header}`]?.$t || "");
    });

    localStorage.setItem(`dadosLoja_${codigoLoja}`, JSON.stringify({
      data: Date.now(),
      cabecalhos,
      dados: dadosPublicos
    }));

    renderizarTabela(dadosPublicos, cabecalhos);
    status.textContent = "✅ Atualizado!";
    status.style.color = "#00C853";
    setTimeout(() => status.textContent = "", 2000);

  } catch (error) {
    console.error("Erro ao atualizar planilha:", error);
    status.textContent = "❌ Não foi possível atualizar. Verifique sua conexão.";
    status.style.color = "#EF5350";
    carregarDadosLocais();
  }
}

function renderizarTabela(dados, cabecalhos) {
  const tbody = document.querySelector("#tabelaPublica tbody");
  tbody.innerHTML = "";

  dados.forEach(linha => {
    const tr = document.createElement("tr");
    linha.forEach(cel => {
      const td = document.createElement("td");
      td.textContent = cel;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}
