const PLANILHA_URL = window.PLANILHAS.lojas;

async function atualizarPlanilha() {
  const status = document.getElementById("statusAtualiza");
  status.textContent = "⏳ Carregando...";
  
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const codigoLoja = urlParams.get('loja');
    
    const response = await fetch(`${PLANILHA_URL}&t=${Date.now()}`);
    const text = await response.text();
    const json = JSON.parse(text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*?)\);/)[1]);

    const colunas = [0, 2, 6, 7, 5]; // Ajustar índices conforme a planilha
    const dadosPublicos = json.table.rows
      .filter(row => row.c[4]?.v === codigoLoja) // Filtra pela coluna do código da loja
      .map(row => ({
        dataHora: row.c[0]?.v || "",
        nome: row.c[2]?.v || "",
        marca: row.c[6]?.v || "",
        produto: row.c[7]?.v || "",
        telefone: formatarTelefone(row.c[5]?.v || "")
      }));

    localStorage.setItem(`dadosLoja_${codigoLoja}`, JSON.stringify({
      data: Date.now(),
      dados: dadosPublicos
    }));

    filtrarDadosPublico(dadosPublicos);
    status.textContent = "✅ Atualizado!";
  } catch (error) {
    console.error("Erro:", error);
    carregarDadosLocais();
  }
}

function filtrarDadosPublico(dados = []) {
  const termo = document.getElementById("buscaPublica").value.toLowerCase();
  const filtrado = dados.filter(item =>
    Object.values(item).join(" ").toLowerCase().includes(termo)
  );
  
  const tbody = document.querySelector("#tabelaPublica tbody");
  tbody.innerHTML = filtrado.map(item => `
    <tr>
      <td>${item.dataHora}</td>
      <td>${item.nome}</td>
      <td>${item.marca}</td>
      <td>${item.produto}</td>
      <td>${item.telefone}</td>
    </tr>
  `).join("");
}

// ... (mantidas as funções formatarTelefone e carregarDadosLocais)
function formatarTelefone(telefone) {
  const nums = telefone.replace(/\D/g, '');
  if (nums.length < 11) return telefone; // Se não tiver 11 dígitos, retorna original
  return nums.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

// Função adaptada para aceitar dados passados ou buscar padrão
function filtrarDadosPublico(dados = null) {
  if (!dados) {
    console.warn("Nenhum dado fornecido para filtro. A função deve buscar no cache ou lidar com fallback.");
    return;
  }

  // Exemplo de tratamento dos dados — adapte conforme seu frontend espera
  console.log("Dados filtrados:", dados);
}
