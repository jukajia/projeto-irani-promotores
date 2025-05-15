const PLANILHA_URL = window.PLANILHAS.lojas;
let dadosFiltrados = [];

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const codigoLoja = params.get("loja");

  if (!codigoLoja) return;

  document.getElementById("tituloLoja").textContent += ` - Loja ${codigoLoja}`;
  atualizarPlanilha();
});

async function atualizarPlanilha() {
  const status = document.getElementById("statusAtualiza");
  status.textContent = "⏳ Carregando...";

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const codigoLoja = urlParams.get('loja');
    if (!codigoLoja) throw new Error("Código da loja não definido");

    const response = await fetch(`${PLANILHA_URL}&t=${Date.now()}`);
    const text = await response.text();
    const json = JSON.parse(text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*?)\);/)[1]);

    const dados = json.table.rows
      .filter(row => row.c[4]?.v === codigoLoja)
      .map(row => ({
        dataHora: row.c[0]?.f ?? row.c[0]?.v ?? "",
        nome: row.c[2]?.v ?? "",
        marca: row.c[6]?.v ?? "",
        produto: row.c[7]?.v ?? "",
        telefone: formatarTelefone(row.c[5]?.v ?? "")
      }));

    localStorage.setItem(`dadosLoja_${codigoLoja}`, JSON.stringify(dados));
    dadosFiltrados = dados;
    renderTabela(dados);

    status.textContent = "✅ Atualizado!";
  } catch (error) {
    console.error("Erro ao atualizar planilha:", error);
    status.textContent = "❌ Erro ao atualizar!";
  }
}

function renderTabela(dados) {
  const tbody = document.querySelector("#tabelaPublica tbody");
  tbody.innerHTML = dados.map(item => `
    <tr>
      <td>${item.dataHora}</td>
      <td>${item.nome}</td>
      <td>${item.marca}</td>
      <td>${item.produto}</td>
      <td>${item.telefone}</td>
    </tr>
  `).join("");
}

function filtrarDadosPublicoLocal() {
  const termo = document.getElementById("buscaPublica").value.toLowerCase();
  const filtrado = dadosFiltrados.filter(item =>
    Object.values(item).join(" ").toLowerCase().includes(termo)
  );
  renderTabela(filtrado);
}

function formatarTelefone(valor) {
  const nums = valor.replace(/\D/g, '');
  return nums.length === 11 ? nums.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3") : valor;
}
