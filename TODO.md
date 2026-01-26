# TODO - FisioReport SaaS

Lista de pendências e melhorias identificadas durante a reestruturação para SaaS.

## Backend (Cloudflare Workers)

- [ ] **Segurança de Senhas:** Atualmente as senhas são salvas em texto puro. Implementar hashing usando `crypto.subtle` (PBKDF2 ou similar) no `register` e `login`.
- [ ] **JWT Secret:** Mover `JWT_SECRET` de `wrangler.jsonc` para segredos do Wrangler (`wrangler secret put JWT_SECRET`).
- [ ] **Geração de PDF:** Implementar a lógica real de geração de relatório PDF (atualmente retorna apenas uma string mock).
- [ ] **Validação de Input:** Adicionar validação robusta de esquemas (Zod ou similar) para os corpos das requisições POST/PUT.
- [ ] Gerar e recuperar dados apenas do usuário autenticado (atualmente não há essa verificação).
    - Usar zustand para gerenciar o estado do usuário autenticado no frontend.

## Frontend (SaaS & Landing Page)

- [ ] **Download de PDF:** Implementar o fluxo de download de arquivo real no componente de Relatórios.
- [ ] **Upload de Fotos:** Atualmente o cadastro de atletas pula o campo de foto. Implementar integração com Cloudflare R2 para armazenamento de imagens.
- [ ] **URL do App:** Atualizar o link "Acessar Sistema" na Landing Page (`src-landing-page/src/app/components/LandingPage.tsx`) com a URL final de produção.
- [ ] **Persistência de Sessão:** Melhorar a verificação de validade do token JWT ao carregar o `App.tsx` para evitar estados inconsistentes.
- [ ] **Tratamento de Erros:** Melhorar o feedback visual para o usuário quando a API retornar erros (mensagens mais amigáveis).
- [ ] **Typing** Remover any das tipagens das rotas

## Infraestrutura / DevOps

- [ ] **Scripts de Banco:** Validar o comportamento do script `database_scripts.sh` em diferentes sistemas operacionais (bash/zsh).
- [ ] **CI/CD:** Configurar GitHub Actions para deploy automático do Worker e das Pages (Landing Page e SaaS).
- [ ] **Ambientes:** Separar configurações de `wrangler.jsonc` para ambientes de `staging` e `production`.

## Repo

- [ ] Tornar repositório privado após o lançamento.

## Bugs

