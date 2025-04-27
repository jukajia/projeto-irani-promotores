# Sistema de Gestão de Promotores - Grupo Irani

Este sistema foi desenvolvido para gerenciar e acompanhar os promotores de vendas nas lojas do Grupo Irani.

## Funcionalidades

- **Login por loja**: Cada loja tem seu próprio acesso
- **Painel do gestor**: Visão completa de todas as lojas
- **Filtros avançados**: Por dia, loja e texto livre
- **Gráficos e relatórios**: Visualização de dados intuitiva
- **Exportação de dados**: Para Excel, CSV e PDF
- **Atualização automática**: Dados em tempo real

## Acesso

1. **Página de login**: `index.html`
   - Selecione a loja e insira a senha

2. **Páginas das lojas**: `loja.html?loja=XXX` (onde XXX é o código da loja)
   - Visualização simplificada para uso diário

3. **Painel do gestor**: `gestor.html`
   - Visão completa com todas as funcionalidades

## Credenciais

| Loja              | Código | Senha |
|-------------------|--------|-------|
| Gestor            | gestor | Ira95101 |
| Brasil            | 001    | 001   |
| Parque Verde      | 002    | 002   |
| Floresta          | 003    | 003   |
| Tancredo          | 004    | 004   |
| Gourmet           | 005    | 005   |
| Portí 1           | 201    | 201   |
| Portí 2           | 202    | 202   |
| Portí 3           | 203    | 203   |
| Portí 4           | 204    | 204   |

## Tecnologias Utilizadas

- HTML5, CSS3, JavaScript
- Chart.js para gráficos
- SheetJS para exportação em Excel/CSV
- jsPDF para exportação em PDF
- Google Sheets como banco de dados

## Implementação

1. Hospedar todos os arquivos em um servidor web
2. Garantir que as planilhas do Google Sheets estejam públicas
3. Acessar o sistema através do arquivo `index.html`