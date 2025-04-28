let dadosPublicos = [];
let diaSelecionado = "Todos";

// Mapeamento das URLs (substitua com seus IDs reais)
const PLANILHAS_LOJAS = {
  '001': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRVQpJV736U_gkzIGzbIdRk4sObA4so3fdj-Emr8WYvd5X20PXr4re_OtEP866H4_LbdJ1p9TJrsRqc/gviz/tq?tqx=out:json',
  '002': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSeMQGffph4J2g3_Bdi20QGGrxvsJlR3i3X1otdlzN2mm7-MyRjHEimz756K8b99id_h2xHZMLMnM6D/gviz/tq?tqx=out:json',
  '003': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSXrPKpL-DdlabNMiX3LRhDIixxspH0QhVcV_btrBgD2NlSpUPaBn0RTlQdby2QZr1Eq_-YhE-v_dPt/gviz/tq?tqx=out:json',
  '004': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSO9jBMI5xgbxgV9-ovOzpm8hiwMrfPLrTj91Pv-qPPANAzi9I3WpCPRAJ98sXCG02q4uKrxDjxlzFp/gviz/tq?tqx=out:json',
  '005': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQgE9gnhIcb2lTWJxIP2VAsDPpdOXUcjGAK6s5YFIXdW-QGkvjm593zkYGBip9S5xIHUBjRCrp-5du5/gviz/tq?tqx=out:json',
  '201': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSSxtoIApsl8rwlz9_yRDIGk5vBofv14Y8jsQyINGhDIEqebTllfx2XNkfv1QtKHkMYN3fwTI6n96h3/gviz/tq?tqx=out:json',
  '202': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTn070Oncl75qOTtDk0V2sd5tsQTc6O7YK4EhmaRpUMjI6G9eyH7G-OqxHE3008zXvo0SuzF4EoyHPg/gviz/tq?tqx=out:json',
  '203': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRsy0shwB9gbG1fsQGVXU77eL94dkzZsow1TXPyVmjYeWRYKR-WC_2ipsFAo2kAgmsOUS0LeoWAOpJ9/gviz/tq?tqx=out:json',
  '204': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSvfd8rATUR6BQ0ENsWUrqOU7YXkNQPqe9IaJm0a32jnAWswQ-PdszJV2WJvoZmwLRdCQjtTTAhwxp9/gviz/tq?tqx=out:json'
  // ... adicione todas as outras lojas no mesmo padrão
};

async function atualizarPlanilha() {
  const status = document.getElementById("statusAtualiza");
  status.textContent = "⏳ Carregando...";

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const codigoLoja = urlParams.get('loja');
    
    if (!codigoLoja || !PLANILHAS_LOJAS[codigoLoja]) {
      throw new Error("Loja não configurada");
    }

    const response = await fetch(`${PLANILHAS_LOJAS[codigoLoja]}&t=${Date.now()}`);
    const text = await response.text();
    const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\((.*)\);/);
    
    if (!jsonMatch) throw new Error("Formato de resposta inválido");

    const json = JSON.parse(jsonMatch[1]);
    dadosPublicos = json.table.rows.map(row => ({
      dataHora: row.c[0]?.f || "",
      nome: row.c[2]?.v || "",
      marca: row.c[6]?.v || "",
      produto: row.c[7]?.v || "",
      telefone: formatarTelefone(row.c[5]?.v || ""),
      diaSemana: row.c[8]?.v || ""
    }));

    localStorage.setItem(`dadosLoja_${codigoLoja}`, JSON.stringify({
      data: Date.now(),
      dados: dadosPublicos
    }));

    filtrarDadosPublico();
    status.textContent = "✅ Atualizado!";
    
  } catch (error) {
    console.error("Erro:", error);
    status.textContent = `❌ Erro: ${error.message}`;
    carregarDadosLocais();
  }
}

function formatarTelefone(tel) {
  const nums = tel.toString().replace(/\D/g, '');
  return nums.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

function carregarDadosLocais() {
  const urlParams = new URLSearchParams(window.location.search);
  const codigoLoja = urlParams.get('loja');
  const dadosLocais = localStorage.getItem(`dadosLoja_${codigoLoja}`);

  if (dadosLocais) {
    const { data, dados } = JSON.parse(dadosLocais);
    if (Date.now() - data < 3600000) { // 1 hora de cache
      dadosPublicos = dados;
      filtrarDadosPublico();
      document.getElementById("statusAtualiza").textContent = 
        "⚠️ Dados locais (última atualização: " + new Date(data).toLocaleTimeString() + ")";
    }
  }
}

// ... (mantenha as outras funções como filtrarDia e filtrarDadosPublico)
// Função principal para carregar dados da planilha
async function atualizarPlanilha() {
  const status = document.getElementById("statusAtualiza");
  status.textContent = "⏳ Carregando...";

  try {
    // 1. Faz a requisição com prevenção de cache
    const response = await fetch(`${window.PLANILHA_URL}&t=${Date.now()}`);
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    
    // 2. Processa o texto da resposta
    const text = await response.text();
    const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\((.*)\);/);
    if (!jsonMatch) throw new Error("Formato de resposta inválido da planilha");

    // 3. Parseia e valida os dados
    const json = JSON.parse(jsonMatch[1]);
    if (!json?.table?.rows) throw new Error("Estrutura de dados incompleta");

    // 4. Mapeia os dados para o formato esperado
    dadosPublicos = json.table.rows.map(row => {
      const celulas = row.c;
      return {
        dataHora: celulas[0]?.f || celulas[0]?.v || "",
        nome: celulas[2]?.v || "",
        marca: celulas[6]?.v || "",
        produto: celulas[7]?.v || "",
        telefone: formatarTelefone(celulas[5]?.v),
        diaSemana: celulas[8]?.v || ""
      };
    });

    // 5. Armazena localmente com timestamp
    localStorage.setItem(`dadosPromotores_${window.PLANILHA_URL}`, JSON.stringify({
      data: Date.now(),
      dados: dadosPublicos
    }));

    // 6. Atualiza a interface
    filtrarDadosPublico();
    status.textContent = "✅ Atualizado!";
    setTimeout(() => status.textContent = "", 2000);

  } catch (error) {
    console.error("Erro ao carregar planilha:", error);
    status.textContent = `❌ Erro: ${error.message}`;
    
    // 7. Fallback para dados locais
    usarDadosLocais();
  }
}

// Função auxiliar para formatar telefone
function formatarTelefone(telefone) {
  if (!telefone) return "";
  const nums = telefone.toString().replace(/\D/g, '');
  return nums.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

// Função para usar dados armazenados localmente
function usarDadosLocais() {
  const dadosLocais = localStorage.getItem(`dadosPromotores_${window.PLANILHA_URL}`);
  if (!dadosLocais) return;

  try {
    const { data, dados } = JSON.parse(dadosLocais);
    
    // Usa dados locais apenas se forem recentes (menos de 1 hora)
    if (Date.now() - data < 3600000) {
      dadosPublicos = dados;
      filtrarDadosPublico();
      document.getElementById("statusAtualiza").textContent = 
        `⚠️ Dados locais (última atualização: ${new Date(data).toLocaleTimeString()})`;
    }
  } catch (e) {
    console.error("Erro ao carregar dados locais:", e);
  }
}

// Filtro por dia da semana
function filtrarDia(dia) {
  diaSelecionado = dia;
  filtrarDadosPublico();
}

// Filtro geral (dia + busca textual)
function filtrarDadosPublico() {
  const termo = document.getElementById("buscaPublica").value.toLowerCase();
  const tabela = document.querySelector("#tabelaPublica tbody");

  const filtrados = dadosPublicos.filter(item => {
    const condDia = diaSelecionado === "Todos" || item.diaSemana === diaSelecionado;
    const condTexto = 
      item.nome.toLowerCase().includes(termo) ||
      item.marca.toLowerCase().includes(termo) ||
      item.produto.toLowerCase().includes(termo) ||
      item.telefone.toLowerCase().includes(termo);
    return condDia && condTexto;
  });

  // Renderiza os resultados
  tabela.innerHTML = filtrados.map(item => `
    <tr>
      <td>${item.dataHora}</td>
      <td>${item.nome}</td>
      <td>${item.marca}</td>
      <td>${item.produto}</td>
      <td>${item.telefone}</td>
    </tr>
  `).join("");
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  // Verifica se a URL da planilha está definida
  if (!window.PLANILHA_URL) {
    console.error("URL da planilha não definida");
    document.getElementById("statusAtualiza").textContent = 
      "⚠️ Configure a URL da planilha";
    return;
  }

  // Carrega dados locais primeiro para exibição rápida
  usarDadosLocais();
  
  // Atualiza com dados da planilha
  atualizarPlanilha();
});
