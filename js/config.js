// js/config.js - Configurações globais do projeto

/**
 * Configurações da Planilha Unificada
 * Planilha Principal: https://docs.google.com/spreadsheets/d/12gGbuVZ47KiUZpzY4c6cO3j4usigBtgUpuL_dgRBkS8/
 */
window.PLANILHAS_CONFIG = {
  // URL base para exportação JSON
  BASE_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQU9GiNO40jd-ZQkU_vzLRfxYhf5kdpZL_BoLmbok9DjLzqYAqHfObnp4MPs2V_HN9ZbWBb4kCHQKfh/pub?',
  
  // Abas específicas
  ABAS: {
    GESTOR: {
      gid: '1632148302',  // ID da aba "Gestor"
      nome: 'Gestor'
    },
    LOJAS: {
      gid: '299822528',   // ID da aba "Todas as Lojas"
      nome: 'Todas as Lojas'
    }
  },
  
  // Gera a URL completa para uma aba específica
  getUrl: function(aba) {
    return `${this.BASE_URL}gid=${this.ABAS[aba].gid}&single=true&output=json`;
  }
};

// Configuração das URLs de acesso
window.PLANILHA_GESTOR_URL = window.PLANILHAS_CONFIG.getUrl('GESTOR');
window.PLANILHA_LOJAS_URL = window.PLANILHAS_CONFIG.getUrl('LOJAS');

// Mapeamento de lojas
window.LOJAS = {
  '001': {
    nome: 'Brasil',
    codigo: '001'
  },
  '002': {
    nome: 'Parque Verde',
    codigo: '002'
  },
  '003': {
    nome: 'Floresta',
    codigo: '003'
  },
  '004': {
    nome: 'Tancredo',
    codigo: '004'
  },
  '005': {
    nome: 'Gourmet',
    codigo: '005'
  },
  '201': {
    nome: 'Portí 1',
    codigo: '201'
  },
  '202': {
    nome: 'Portí 2',
    codigo: '202'
  },
  '203': {
    nome: 'Portí 3',
    codigo: '203'
  },
  '204': {
    nome: 'Portí 4',
    codigo: '204'
  }
};

// Configuração de Cores
window.CORES = {
  primaria: '#00C853',
  secundaria: '#29B6F6',
  erro: '#EF5350',
  alerta: '#FFC107',
  fundo: '#121212',
  texto: '#FFFFFF'
};

// Configuração de Cache (em minutos)
window.CACHE_CONFIG = {
  tempoAtualizacao: 5,    // Atualizar a cada 5 minutos
  tempoValidade: 60       // Dados válidos por 60 minutos
};
