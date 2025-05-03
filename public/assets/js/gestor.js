// Substitua pelos seus valores
const CLIENT_ID = '';
const API_KEY = '';
const DISCOVERY_DOCS = ["https://docs.google.com/spreadsheets/d/12gGbuVZ47KiUZpzY4c6cO3j4usigBtgUpuL_dgRBkS8/edit?usp=sharing"];
const SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

// ID da planilha e intervalo de dados
const SPREADSHEET_ID = '12gGbuVZ47KiUZpzY4c6cO3j4usigBtgUpuL_dgRBkS8';
const RANGE = 'Gestor!A1:k'; // Essa é a aba consolidada para os gestores

function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(() => {
    // Verifica se o usuário já está autenticado
    if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
      listData();
    } else {
      // Solicita autenticação
      gapi.auth2.getAuthInstance().signIn().then(() => {
        listData();
      });
    }
  });
}

function listData() {
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
  }).then(response => {
    const data = response.result.values;
    renderTable(data);
  }, error => {
    console.error('Erro ao carregar os dados da planilha:', error);
  });
}

function renderTable(data) {
  const tabela = document.getElementById('tabelaResultados');
  let html = '<table><thead><tr>';

  // Cabeçalhos
  data[0].forEach(header => {
    html += `<th>${header}</th>`;
  });
  html += '</tr></thead><tbody>';

  // Dados
  for (let i = 1; i < data.length; i++) {
    html += '<tr>';
    data[i].forEach(cell => {
      html += `<td>${cell}</td>`;
    });
    html += '</tr>';
  }

  html += '</tbody></table>';
  tabela.innerHTML = html;
}

// Inicializa a API ao carregar a página
document.addEventListener('DOMContentLoaded', handleClientLoad);

