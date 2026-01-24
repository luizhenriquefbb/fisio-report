# FisioReport 🏥

[Pagina inicial](https://luizhenriquefbb.github.io/fisio-report/)

**FisioReport** é uma aplicação desktop de alta performance desenvolvida para fisioterapeutas de clubes de futebol. O objetivo principal é agilizar a coleta de dados clínicos diários, substituindo planilhas manuais por uma interface intuitiva baseada em seleção rápida.

## 🚀 Funcionalidades Principais

- **Dashboard Inteligente:** Visualize o status clínico do elenco em tempo real e realize edições rápidas diretamente na tabela.
- **Gestão de Atletas:** Cadastro completo de jogadores com foto e posição.
- **Catálogo Clínico:** Gerencie Queixas, Tratamentos e Períodos de trabalho.
- **Relatórios Diários:** Agrupamento automático de registros por data e estatísticas mensais de atendimento.
- **Proteção de Dados:** Sistema de integridade que impede a exclusão acidental de itens com histórico clínico vinculado.

## 🛠 Tecnologias

- **Backend:** Rust + Tauri v2
- **Frontend:** React + TypeScript + Vite
- **Banco de Dados:** SQLite (Embutido)
- **Interface:** Bootstrap 5 + Lucide Icons

## 💻 Como Executar

### Pré-requisitos
- Node.js (v18+)
- Rust (Cargo)

### Desenvolvimento
```bash
# Instalar dependências
npm install

# Iniciar o ambiente de desenvolvimento
npm run tauri dev
```

### Build (Produção)
```bash
npm run tauri build
```

## 📂 Estrutura do Projeto

- `src/`: Código fonte do frontend (React).
- `src-tauri/`: Backend em Rust, incluindo lógica de banco de dados e comandos.
- `src-landing-page/`: Site de marketing (Landing Page) em React + Tailwind.
- `designs/`: Referências visuais do projeto.
- `sqliteutils/`: Ferramentas auxiliares em Python para manutenção do banco de dados.

---
*Desenvolvido para agilizar o dia a dia no departamento médico.*