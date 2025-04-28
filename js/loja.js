const PLANILHAS_LOJAS = {
  '001': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRVQpJV736U_gkzIGzbIdRk4sObA4so3fdj-Emr8WYvd5X20PXr4re_OtEP866H4_LbdJ1p9TJrsRqc/gviz/tq?tqx=out:json',
  '002': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSeMQGffph4J2g3_Bdi20QGGrxvsJlR3i3X1otdlzN2mm7-MyRjHEimz756K8b99id_h2xHZMLMnM6D/gviz/tq?tqx=out:json',
  '003': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSXrPKpL-DdlabNMiX3LRhDIixxspH0QhVcV_btrBgD2NlSpUPaBn0RTlQdby2QZr1Eq_-YhE-v_dPt/gviz/tq?tqx=out:json',
  '004': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSO9jBMI5xgbxV9-ovOzpm8hiwMrfPLrTj91Pv-qPPANAzi9I3WpCPRAJ98sXCG02q4uKrxDjxlzFp/gviz/tq?tqx=out:json',
  '005': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQgE9gnhIcb2lTWJxIP2VAsDPpdOXUcjGAK6s5YFIXdW-QGkvjm593zkYGBip9S5xIHUBjRCrp-5du5/gviz/tq?tqx=out:json'
};

async function atualizarPlanilha() {
  const status = document.getElementById("statusAtualiza");
  status.textContent = "⏳ Carregando...";
  status.style.color = "#FFC107";

  try {
    // Recupera o código da loja a partir da URL
    const urlParams = new URLSearchParams(window.location.search);
    const codigoLoja = urlParams.get('loja');

    // Valida o código da loja
    if (!codigoLoja || !PLANILHAS_LOJAS[codigoLoja]) {
      throw new Error("Loja não configurada ou código inválido");
    }

    // Faz a requisição à URL da planilha
    const response = await fetch(`${PLANILHAS_LOJAS[codigoLoja]}&t=${Date.now()}`);
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

    const text = await response.text();
    const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\((.*)\);/);
    if (!jsonMatch) throw new Error("Formato de resposta inválido da planilha");

    const json = JSON.parse(jsonMatch[1]);
    if (!json?.table?.rows) throw new Error("Estrutura de dados incompleta");

    // Processa os dados da planilha
    const dadosPublicos = json.table.rows.map(row => ({
      dataHora: row.c[0]?.f || row.c[0]?.v || "",
      nome: row.c[2]?.v || "",
      marca: row.c[6]?.v || "",
      produto: row.c[7]?.v || "",
      telefone: formatarTelefone(row.c[5]?.v || ""),
      diaSemana: row.c[8]?.v || ""
    }));

    // Salva no LocalStorage para cache
    localStorage.setItem(`dadosLoja_${codigoLoja}`, JSON.stringify({
      data: Date.now(),
      dados: dadosPublicos
    }));

    filtrarDadosPublico();
    status.textContent = "✅ Atualizado!";
    status.style.color = "#00C853";
    setTimeout(() => status.textContent = "", 2000);

  } catch (error) {
    // Tratamento de erros
    console.error("Erro ao atualizar planilha:", error);
    status.textContent = `❌ Erro: ${error.message}`;
    status.style.color = "#EF5350";

    // Carrega dados locais em caso de falha
    carregarDadosLocais();
  }
}

// Função para carregar dados em caso de erro ou offline
function carregarDadosLocais() {
  const urlParams = new URLSearchParams(window.location.search);
  const codigoLoja = urlParams.get('loja');
  const dadosLocais = localStorage.getItem(`dadosLoja_${codigoLoja}`);

  if (dadosLocais) {
    try {
      const { data, dados } = JSON.parse(dadosLocais);
      if (Date.now() - data < 3600000) { // 1 hora
        filtrarDadosPublico(dados);
        document.getElementById("statusAtualiza").textContent =
          `⚠️ Dados carregados do cache (atualizados há ${new Date(data).toLocaleTimeString()}).`;
      }
    } catch (error) {
      console.error("Erro ao carregar cache:", error);
    }
  }
}

// Função para formatar telefone
function formatarTelefone(telefone) {
  const nums = telefone.replace(/\D/g, '');
  return nums.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}
