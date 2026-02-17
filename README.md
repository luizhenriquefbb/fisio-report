# FisioReport 🏥

[FisioReport](https://hosting.fisioreport-app.pages.dev/) (Placeholder)

**FisioReport** é uma aplicação SaaS web de alta performance desenvolvida para fisioterapeutas de clubes de futebol. O objetivo principal é agilizar a coleta de dados clínicos diários, substituindo planilhas manuais por uma interface intuitiva baseada em seleção rápida ("selection over typing").

## 🚀 Funcionalidades Principais

- **Autenticação:** Sistema de login e cadastro seguro para isolamento de dados.
- **Dashboard Inteligente:** Visualize o status clínico do elenco em tempo real e realize edições rápidas diretamente na tabela.
- **Gestão de Atletas:** Cadastro completo de jogadores com histórico clínico vinculado.
- **Catálogo Clínico:** Gerencie Queixas, Tratamentos e Períodos de trabalho de forma estruturada.
- **Relatórios Diários:** Agrupamento automático de atendimentos e estatísticas de evolução.
- **Proteção de Dados:** Sistema que impede a exclusão de itens que possuam histórico clínico.

## 🛠 Tecnologias

- **Backend:** TypeScript + Cloudflare Workers (Hono)
- **Frontend:** React + TypeScript + Vite
- **Banco de Dados:** Cloudflare D1 (SQL Relacional na borda)
- **Hospedagem:** Cloudflare Pages
- **IaC:** Terraform
- **Estilização:** Bootstrap 5 + Tailwind CSS (Landing Page)

## 💻 Como Executar

### Pré-requisitos
- Node.js (v18+)
- Wrangler CLI (`npm install -g wrangler`)
- Terraform (v1.0+)

### Infraestrutura (Cloudflare)
O projeto utiliza Terraform para gerenciar a infraestrutura.

1. **Inicializar:**
```bash
cd infra
terraform init
```

2. **Aplicar (Deploy):**
```bash
terraform apply
```

3. **Destruir:**
```bash
terraform destroy
```

### Desenvolvimento Local

1. **Backend:**
```bash
cd backend
npm install
npm run dev
```

2. **Frontend (SaaS):**
```bash
npm install
npm run dev
```

3. **Landing Page:**
```bash
cd src-landing-page
npm install
npm run dev
```

## 📂 Estrutura do Projeto

- `infra/`: Configuração Terraform (IaC).
- `src/`: SaaS Frontend (React).
- `backend/`: API em TypeScript (Cloudflare Workers).
- `src-landing-page/`: Site de marketing.
- `TODO.md`: Lista de pendências e melhorias futuras.

---
*Transformando o departamento médico em um centro de alta performance.*
