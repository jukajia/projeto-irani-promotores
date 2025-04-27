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
function parseGoogleSheetsResponse(text) {
  try {
    const startMarker = "/*O_o*/";
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    
    if (!text.includes(startMarker) || jsonStart === -1) {
      throw new Error("Resposta não é do Google Sheets");
    }
    
    return JSON.parse(text.substring(jsonStart, jsonEnd));
  } catch (e) {
    console.error("Falha no parse:", { 
      error: e, 
      responseSample: text.substring(0, 100) 
    });
    throw e;
  }
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
      const json = parseGoogleSheetsResponse(text);
      
      // Debug: Mostra a estrutura recebida
      console.log("Estrutura recebida:", {
        cols: json.table.cols.map(c => c.label),
        firstRow: json.table.rows[0]?.c?.map(c => c?.v)
      });

      dadosPublicos = json.table.rows.map(row => ({
        diaSemana: row.c[COLUNAS.DIA_SEMANA]?.v || "",
        nome: row.c[COLUNAS.NOME]?.v || "",
        marca: row.c[COLUNAS.MARCA]?.v || "",
        produto: row.c[COLUNAS.PRODUTO]?.v || "",
        telefone: row.c[COLUNAS.TELEFONE]?.v || "",
        _raw: row.c // Mantém os dados brutos para debug
      }));

      localStorage.setItem(`dadosPromotores_${window.PLANILHA_URL}`, JSON.stringify({
        data: new Date().getTime(),
        dados: dadosPublicos
      }));

      filtrarDadosPublico();
      status.textContent = "✅ Atualizado!";
    })
    .catch(err => {
      console.error("Erro completo:", {
        error: err,
        url: window.PLANILHA_URL,
        timestamp: new Date().toISOString()
      });
      
      status.textContent = "❌ Erro ao carregar";
      status.title = err.message;
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
