const PLANILHA_URL = window.PLANILHAS.lojas;
let dadosFiltrados = [];

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const codigoLoja = params.get("loja");

  if (!codigoLoja) return;

  document.getElementById("tituloLoja").textContent += ` - Loja ${codigoLoja}`;
  carregarDados(codigoLoja);
});

async function carregarDados(codigoLoja) {
  try {
    const res = await fetch(`${PLANILHA_URL}&t=${Date.now()}`);
    const text = await res.text();
    const json = JSON.parse(text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*?)\);/)[1]);

    const dados = json.table.rows
      .filter(r => r.c[4]?.v === codigoLoja)
      .map(r => ({
        dataHora: r.c[0]?.f ?? r.c[0]?.v ?? "",
        nome: r.c[2]?.v ?? "",
        marca: r.c[6]?.v ?? "",
        produto: r.c[7]?.v ?? "",
        telefone: formatarTelefone(r.c[5]?.v ?? "")
      }));

    localStorage.setItem(`dadosLoja_${codigoLoja}`, JSON.stringify(dados));
    dadosFiltrados = dados;
    renderTabela(dados);
  } catch (err) {
    console.error("Erro ao carregar dados:", err);
    const cache = localStorage.getItem(`dadosLoja_${codigoLoja}`);
    if (cache) {
      dadosFiltrados = JSON.parse(cache);
      renderTabela(dadosFiltrados);
    }
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
