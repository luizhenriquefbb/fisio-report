# Instruções de Setup - FisioReport SaaS (Cloudflare TypeScript + D1)

A reestruturação para SaaS foi concluída utilizando Cloudflare Workers (TypeScript), D1 (Banco de Dados Relacional) e Cloudflare Pages (Frontends).

## 🚀 Deploy Rápido (Cloudflare)

Para subir toda a infraestrutura (Banco D1, Backend e os dois Frontends) com um único comando:

```bash
npm run deploy:cloudflare
```

Este comando irá:
1. Criar o banco D1 `fisioreport-db` (se não existir).
2. Atualizar automaticamente o `database_id` em `backend/wrangler.jsonc`.
3. Aplicar o schema SQL remoto.
4. Fazer deploy do Backend (Worker).
5. Buildar e fazer deploy da Landing Page (`fisioreport-landing`).
6. Buildar e fazer deploy do SaaS App (`fisioreport-app`).

Para destruir tudo:
```bash
npm run destroy:cloudflare
```

---

## 🛠 Desenvolvimento Local

### 1. Preparar o Banco de Dados Local
```bash
# Aplica o schema no banco local
./backend/database_scripts.sh --action migrate --local

# (Opcional) Popula com dados de teste (admin@fisioreport.com / password)
./backend/database_scripts.sh --action seed --local
```

### 2. Rodar o Backend
```bash
cd backend
npm install
npm run dev
```
O backend rodará em `http://localhost:8787`.

### 3. Rodar os Frontends (Em terminais separados)

**SaaS App (Raiz):**
```bash
npm install
npm run dev
```
Acesse `http://localhost:1420`.

**Landing Page:**
```bash
cd src-landing-page
npm install
npm run dev
```

---

## 📝 Comandos de Banco de Dados (`database_scripts.sh`)

Você pode usar o script auxiliar para tarefas granulares:
- `./backend/database_scripts.sh --action migrate --local|--remote`
- `./backend/database_scripts.sh --action seed --local|--remote`

---

## ⚠️ Notas Importantes

*   **Segurança:** O `JWT_SECRET` está definido em `backend/wrangler.jsonc`. Para produção, recomendo usar `wrangler secret put JWT_SECRET`.
*   **URLs de Produção:** Após o deploy, os links das Pages serão exibidos no terminal. Atualize o link "Acessar Sistema" na Landing Page (`src-landing-page/src/app/components/LandingPage.tsx`) com a URL real do seu app.
*   **Logs:** O backend está configurado com logs detalhados. Você pode acompanhá-los durante o desenvolvimento no terminal do `wrangler dev`.