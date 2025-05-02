/**
 * CONFIGURAÇÕES CENTRAIS DO SISTEMA DE GESTÃO DE PROMOTORES
 * 
 * Este arquivo contém todas as configurações globais do sistema,
 * incluindo URLs de planilhas e mapeamentos de dados.
 */

// Configuração da URL base da planilha principal
window.PLANILHA_URL = 'https://docs.google.com/spreadsheets/d/12gGbuVZ47KiUZpzY4c6cO3j4usigBtgUpuL_dgRBkS8/gviz/tq?tqx=out:json';

// Tempo de cache para dados locais (em milissegundos)
window.CACHE_EXPIRATION = 3600000; // 1 hora

// Configuração das abas da planilha
window.ABAS_PLANILHA = {
  GESTOR: {
    nome: 'Gestor',
    colunas: {
      DATA: 0,
      HORA: 1,
      NOME: 2,
      LOJA: 3,
      MARCA: 4,
      PRODUTO: 5,
      TELEFONE: 6,
      DIA_SEMANA: 7
    }
  },
  LOJAS: {
    nome: 'Todas as Lojas',
    colunas: {
      DATA: 0,
      NOME: 1,
      MARCA: 2,
      PRODUTO: 3,
      TELEFONE: 4,
      LOJA: 5,
      DIA_SEMANA: 6
    }
  }
};

// Mapeamento completo das lojas
window.LOJAS = {
  '001': { nome: 'Brasil', tipo: 'Supermercado' },
  '002': { nome: 'Parque Verde', tipo: 'Supermercado' },
  '003': { nome: 'Floresta', tipo: 'Supermercado' },
  '004': { nome: 'Tancredo', tipo: 'Supermercado' },
  '005': { nome: 'Gourmet', tipo: 'Supermercado' },
  '201': { nome: 'Portí 1', tipo: 'Atacadista' },
  '202': { nome: 'Portí 2', tipo: 'Atacadista' },
  '203': { nome: 'Portí 3', tipo: 'Atacadista' },
  '204': { nome: 'Portí 4', tipo: 'Atacadista' }
};

// Configurações de exportação
window.EXPORT_CONFIG = {
  nomeArquivo: 'Relatorio_Gestor',
  pdf: {
    orientacao: 'l', // paisagem
    formato: 'a4',
    margem: 20
  }
};

// Validação inicial das configurações
(function() {
  if (!window.PLANILHA_URL) {
    console.error('Erro de configuração: PLANILHA_URL não definida');
  }
  
  if (!window.ABAS_PLANILHA.GESTOR || !window.ABAS_PLANILHA.LOJAS) {
    console.error('Erro de configuração: Abas da planilha não definidas corretamente');
  }
})();
