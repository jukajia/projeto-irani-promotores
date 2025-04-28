let dadosPublicos = [];
let diaSelecionado = "Todos";

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
