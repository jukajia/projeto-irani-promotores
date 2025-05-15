# Sistema de Gestão de Promotores - Supermercado Irani

## Descrição
Sistema web para gerenciamento e visualização dos atendimentos dos promotores de vendas nas lojas da rede Supermercado Irani. Possui:

- Login com acesso para gestor e lojas específicas.
- Painel do gestor com filtros, gráficos e exportação de relatórios.
- Visualização pública por loja com filtros dinâmicos.
- Integração com Google Sheets para dados dinâmicos.
- Tema escuro, responsivo e performance otimizada.

## Tecnologias
- HTML, CSS (dark mode), JavaScript (Vanilla)
- Chart.js para gráficos
- XLSX e jsPDF para exportação de relatórios
- Google Sheets como backend simples

## Estrutura do Projeto
/
├── index.html # Página de login
├── gestor.html # Painel do gestor
├── loja.html # Visualização pública das lojas
├── css/
│ └── style.css # Estilos globais e dark mode
├── js/
│ ├── auth.js # Lógica de login e autenticação simples
│ ├── gestor.js # Lógica do painel do gestor (fetch, filtros, gráficos)
│ └── loja.js # Lógica da página pública da loja
├── config.js # URLs das planilhas Google Sheets
└── imagens/ # Imagens e logos

markdown
Copiar
Editar

## Como rodar localmente
1. Clone este repositório.
2. Certifique-se de que os arquivos estão com a estrutura correta.
3. Abra o arquivo `index.html` em um navegador moderno (Chrome, Firefox, Edge).
4. Para testes locais, pode usar servidores estáticos simples (ex: `live-server`, `http-server`, VSCode Live Preview).

## Configuração das Planilhas
As URLs das planilhas públicas devem ser configuradas em `config.js`. Atualize os links se houver mudanças nos IDs ou permissões.

## Deploy recomendado
Hospede no Vercel, Netlify ou Firebase Hosting para melhor performance e HTTPS nativo.

## Notas importantes
- A autenticação atual é simples e não recomendada para produção sem backend seguro.
- A atualização dos dados da planilha ocorre a cada 5 minutos.
- Cache local é utilizado para melhorar performance e permitir acesso offline parcial.

## Contato
Para dúvidas ou suporte, entre em contato com o responsável do projeto.

---

**Desenvolvido por Juka e J.A.R.V.I.S.**
