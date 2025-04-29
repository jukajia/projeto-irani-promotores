const PLANILHAS_LOJAS = {
  '001': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRVQpJV736U_gkzIGzbIdRk4sObA4so3fdj-Emr8WYvd5X20PXr4re_OtEP866H4_LbdJ1p9TJrsRqc/gviz/tq?tqx=out:json',
  '002': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSeMQGffph4J2g3_Bdi20QGGrxvsJlR3i3X1otdlzN2mm7-MyRjHEimz756K8b99id_h2xHZMLMnM6D/gviz/tq?tqx=out:json',
  '003': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSXrPKpL-DdlabNMiX3LRhDIixxspH0QhVcV_btrBgD2NlSpUPaBn0RTlQdby2QZr1Eq_-YhE-v_dPt/gviz/tq?tqx=out:json',
  '004': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSO9jBMI5xgbxV9-ovOzpm8hiwMrfPLrTj91Pv-qPPANAzi9I3WpCPRAJ98sXCG02q4uKrxDjxlzFp/gviz/tq?tqx=out:json',
  '005': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQgE9gnhIcb2lTWJxIP2VAsDPpdOXUcjGAK6s5YFIXdW-QGkvjm593zkYGBip9S5xIHUBjRCrp-5du5/gviz/tq?tqx=out:json',
  '201': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSSxtoIApsl8rwlz9_yRDIGk5vBofv14Y8jsQyINGhDIEqebTllfx2XNkfv1QtKHkMYN3fwTI6n96h3/gviz/tq?tqx=out:json',
  '202': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTn070Oncl75qOTtDk0V2sd5tsQTc6O7YK4EhmaRpUMjI6G9eyH7G-OqxHE3008zXvo0SuzF4EoyHPg/gviz/tq?tqx=out:json',
  '203': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRsy0shwB9gbG1fsQGVXU77eL94dkzZsow1TXPyVmjYeWRYKR-WC_2ipsFAo2kAgmsOUS0LeoWAOpJ9/gviz/tq?tqx=out:json',
  '204': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSvfd8rATUR6BQ0ENsWUrqOU7YXkNQPqe9IaJm0a32jnAWswQ-PdszJV2WJvoZmwLRdCQjtTTAhwxp9/gviz/tq?tqx=out:json'
};

async function atualizarPlanilha() {
  const status = document.getElementById("statusAtualiza");
  status.textContent = "⏳ Carregando...";
  status.style.color = "#FFC107";

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const codigoLoja = urlParams.get('loja');

    if (!codigoLoja || !PLANILHAS_LOJAS[codigoLoja]) {
      throw new Error("Loja não configurada ou código inválido.");
    }

    const response = await fetch(`${PLANILHAS_LOJAS[codigoLoja]}&t=${Date.now()}`);
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

    const text = await response.text();
    const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\((.*)\);/);

    if (!jsonMatch) throw new Error("Formato de resposta inesperado. Tente novamente mais tarde.");

    const json = JSON.parse(jsonMatch[1]);
    if (!json?.table?.rows) throw new Error("Dados da planilha indisponíveis no momento.");

    const dadosPublicos = json.table.rows.map(row => ({
      dataHora: row?.c?.[0]?.f || row?.c?.[0]?.v || "",
      nome: row?.c?.[2]?.v || "",
      marca: row?.c?.[6]?.v || "",
      produto: row?.c?.[7]?.v || "",
      telefone: formatarTelefone(row?.c?.[5]?.v || ""),
      diaSemana: row?.c?.[8]?.v || ""
    }));

    localStorage.setItem(`dadosLoja_${codigoLoja}`, JSON.stringify({
      data: Date.now(),
      dados: dadosPublicos
    }));

    filtrarDadosPublico(dadosPublicos);

    status.textContent = "✅ Atualizado!";
    status.style.color = "#00C853";
    setTimeout(() => (status.textContent = ""), 2000);

  } catch (error) {
    console.error("Erro ao atualizar planilha:", error);

    status.textContent = "❌ Não foi possível atualizar. Verifique sua conexão ou tente mais tarde.";
    status.style.color = "#EF5350";

    carregarDadosLocais();
  }
}

function carregarDadosLocais() {
  const urlParams = new URLSearchParams(window.location.search);
  const codigoLoja = urlParams.get('loja');
  const dadosLocais = localStorage.getItem(`dadosLoja_${codigoLoja}`);

  if (dadosLocais) {
    try {
      const { data, dados } = JSON.parse(dadosLocais);

      // Aceita dados do cache se forem de até 1 hora atrás
      if (Date.now() - data < 3600000) {
        filtrarDadosPublico(dados);
        document.getElementById("statusAtualiza").textContent =
          `⚠️ Dados carregados do cache (última atualização às ${new Date(data).toLocaleTimeString()}).`;
      }
    } catch (error) {
      console.error("Erro ao carregar dados locais:", error);
    }
  }
}

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
