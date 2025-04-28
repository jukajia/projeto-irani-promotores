// js/loja.js
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
};

async function atualizarPlanilha() {
  const status = document.getElementById("statusAtualiza");
  status.textContent = "⏳ Carregando...";
  status.style.color = "#FFC107";

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const codigoLoja = urlParams.get('loja');

    if (!codigoLoja || !PLANILHAS_LOJAS[codigoLoja]) {
      throw new Error("Loja não configurada");
    }

    const response = await fetch(`${PLANILHAS_LOJAS[codigoLoja]}&t=${Date.now()}`);
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

    const text = await response.text();
    const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\((.*)\);/);
    if (!jsonMatch) throw new Error("Formato de resposta inválido da planilha");

    const json = JSON.parse(jsonMatch[1]);
    if (!json?.table?.rows) throw new Error("Estrutura de dados incompleta");

    dadosPublicos = json.table.rows.map(row => ({
      dataHora: row.c[0]?.f || row.c[0]?.v || "",
      nome: row.c[2]?.v || "",
      marca: row.c[6]?.v || "",
      produto: row.c[7]?.v || "",
      telefone: formatarTelefone(row.c[5]?.v),
      diaSemana: row.c[8]?.v || ""
    }));

    localStorage.setItem(`dadosLoja_${codigoLoja}`, JSON.stringify({
      data: Date.now(),
      dados: dadosPublicos
    }));

    filtrarDadosPublico();
    status.textContent = "✅ Atualizado!";
    status.style.color = "#00C853";
    setTimeout(() => status.textContent = "", 2000);

  } catch (error) {
    console.error("Erro:", error);
    status.textContent = `❌ Erro: ${error.message}`;
    status.style.color = "#EF5350";
    carregarDadosLocais();
  }
}

// Rest of the file remains the same...

// Formata o telefone para padrão (xx) xxxxx-xxxx
function formatarTelefone(tel) {
  if (!tel) return "";
  const nums = tel.toString().replace(/\D/g, '');
  return nums.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

// Carrega dados locais em caso de erro ou cache
function carregarDadosLocais() {
  const urlParams = new URLSearchParams(window.location.search);
  const codigoLoja = urlParams.get('loja');
  const dadosLocais = localStorage.getItem(`dadosLoja_${codigoLoja}`);

  if (dadosLocais) {
    try {
      const { data, dados } = JSON.parse(dadosLocais);
      if (Date.now() - data < 3600000) { // 1 hora
        dadosPublicos = dados;
        filtrarDadosPublico();
        document.getElementById("statusAtualiza").textContent =
          `⚠️ Dados locais (última atualização: ${new Date(data).toLocaleTimeString()})`;
      }
    } catch (e) {
      console.error("Erro ao carregar dados locais:", e);
    }
  }
}

// Filtro por dia da semana
function filtrarDia(dia) {
  diaSelecionado = dia;
  filtrarDadosPublico();
}

// Filtro geral
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

// Inicialização automática
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const codigoLoja = urlParams.get('loja');

  if (!codigoLoja || !PLANILHAS_LOJAS[codigoLoja]) {
    console.error("Loja não configurada");
    document.getElementById("statusAtualiza").textContent = "⚠️ Loja não configurada";
    return;
  }

  carregarDadosLocais();
  atualizarPlanilha();
});
async function atualizarPlanilha() {
  const status = document.getElementById("statusAtualiza");
  status.textContent = "⏳ Carregando...";
  try {
    const url = `${window.PLANILHA_URL}&t=${Date.now()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    const text = await res.text();
    const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*?)\);/);
    if (!match) throw new Error("Formato de resposta inválido");
    const json = JSON.parse(match[1]);
    // ... processar rows como antes
  } catch(err) {
    console.error(err);
    status.textContent = `❌ ${err.message}`;
    carregarDadosLocais();
  }
}
