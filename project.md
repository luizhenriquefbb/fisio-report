# 🏥 FisioReport

**FisioReport** é uma aplicação desktop de alta performance desenvolvida para otimizar o fluxo de trabalho de fisioterapeutas em equipes de futebol de alto rendimento. O objetivo principal é substituir planilhas manuais e processos repetitivos por uma interface ágil, onde a geração de relatórios diários se torna uma tarefa de poucos cliques.

## 🚀 Visão Geral

O fisioterapeuta de um clube de futebol lida com um volume alto de dados diários sobre o estado clínico dos jogadores. O FisioReport simplifica esse processo oferecendo uma interface focada em **seleção** em vez de **digitação**. O sistema permite pré-configurar opções clínicas (como tipos de tratamentos, queixas comuns e status de recuperação) para que o preenchimento do relatório diário seja extremamente rápido.

## 🛠 Tech Stack (Tecnologias)

O projeto utiliza uma arquitetura moderna e robusta, priorizando performance local e baixo consumo de recursos.

- **Desktop Framework:** [Tauri v2](https://tauri.app/) (Rust)
  - Responsável pelo gerenciamento de janelas, acesso ao sistema de arquivos e orquestração do backend.
  - Garante um executável final extremamente leve e seguro.
- **Frontend:** [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
  - Interface reativa e tipada para garantir estabilidade no desenvolvimento.
- **Database:** [SQLite](https://www.sqlite.org/index.html)
  - Banco de dados relacional embarcado localmente. Não requer instalação de servidores externos, garantindo que os dados fiquem no dispositivo do usuário.
- **Linguagens:** Rust (Backend logic) e TypeScript (Frontend logic).

---

## ✨ Funcionalidades Principais

### 1. Dashboard de Relatórios Diários
A tela principal é uma tabela inteligente onde o profissional registra o estado de cada atleta.
As colunas foram projetadas para minimizar a entrada de texto manual:

| Coluna | Tipo de Entrada | Descrição |
| :--- | :--- | :--- |
| **Atleta** | Seleção (Dropdown) | Lista de jogadores do elenco. |
| **Queixa** | Seleção (Dropdown) | Ex: "Dor muscular", "Entorse", "Pós-operatório". |
| **Período** | Seleção (Dropdown) | Ex: "Manhã", "Tarde", "Integral". |
| **Tratamento** | Seleção (Dropdown) | Ex: "Crioterapia", "Eletroestimulação", "Liberação Miofascial". |
| **Status** | Seleção Visual | Indicador visual (cores) do estado do atleta: <br>🟢 **Verde** (Apto/Liberado)<br>🟡 **Amarelo** (Transição/Observação)<br>🔴 **Vermelho** (No DM/Vetado) |
| **Observações** | Texto Livre | Espaço para anotações específicas do dia. |

### 2. Sistema de Configuração (Gestão de Cadastros)
Para manter a agilidade, o sistema possui uma área administrativa onde o usuário define as opções disponíveis nos dropdowns.
- Cadastro de Atletas (com foto e posição).
- Cadastro de Tipos de Queixas.
- Cadastro de Tratamentos.
- Cadastro de Períodos e Status.
- Customização do Template do Relatório (Cabeçalho e Rodapé).

### 3. Geração de Relatórios PDF
- Compilação dos registros do dia em um arquivo PDF formatado.
- Layout profissional pronto para ser enviado à comissão técnica.

---

## 🏗 Estrutura do Backend e Arquitetura

O sistema segue o modelo de **Monolito Modular Local**.

1.  **Frontend (View Layer):**
    - Desenvolvido em React, ele não possui lógica de negócios crítica.
    - Comunica-se com o backend através da ponte IPC (Inter-Process Communication) do Tauri.
    - Ex: Quando o usuário clica em "Salvar", o React envia um comando `invocable` para o Rust.

2.  **Backend (Core Layer - Rust):**
    - A "inteligência" da aplicação reside no código Rust (`src-tauri`).
    - Gerencia a conexão com o **SQLite**.
    - Executa validações de integridade de dados.
    - Realiza operações de I/O (Input/Output) pesadas, como a geração do arquivo PDF e manipulação de imagens dos atletas.

### Modelo de Dados (SQLite)
O banco de dados é estruturado para garantir a consistência das relações. Tabelas principais identificadas:
- `players` (Atletas)
- `status` (Estados clínicos)
- `shifts` (Períodos de treino)
- `treatments` (Tipos de tratamento)
- `records` (O registro diário que liga um atleta a um tratamento, status e período em uma data específica).

---

## ⚠️ Edge Cases e Regras de Negócio Críticas

### Integridade Referencial na Exclusão (Soft Delete vs. Block)
Uma regra de negócio vital implementada no backend é a **proteção de histórico**.

> **O Problema:** Se um usuário tentar excluir um tipo de tratamento (ex: "Crioterapia") que já foi usado em relatórios de meses anteriores, a exclusão simples quebraria o histórico dos relatórios passados.

> **A Solução (Regra de Bloqueio):**
> O sistema implementa uma verificação rigorosa antes de qualquer exclusão (DELETE).
> 1. O usuário solicita a remoção de um item (ex: um Atleta ou um Tratamento).
> 2. O Backend (Rust) consulta o banco `sqlite` para verificar se existem registros na tabela `records` que referenciam este item.
> 3. **Se houver registros:** A operação é bloqueada e uma mensagem explicativa é retornada ao frontend (ex: *"Não é possível remover 'Crioterapia' pois existem 15 registros históricos vinculados a este tratamento"*).
> 4. **Se não houver:** A exclusão é permitida.

### Visualização de Status
O campo de status não é apenas texto. Ele carrega uma propriedade visual (cor) que deve ser persistida e renderizada consistentemente tanto na tela quanto no PDF gerado.

---

## 💻 Como Rodar o Projeto

Pré-requisitos: Node.js e Rust instalados.

```bash
# Instalar dependências do frontend
npm install

# Rodar em modo de desenvolvimento (Janela Desktop)
npm run tauri dev
```