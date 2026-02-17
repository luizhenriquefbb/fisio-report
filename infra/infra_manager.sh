#!/bin/bash

# DEPRECATED: Using terraform for infra management

set -e
ROOT_FOLDER=$(dirname $0)/..
cd $ROOT_FOLDER

# infra_manager.sh (Root)

DB_NAME="fisioreport-db"
CONFIG_FILE="backend/wrangler.jsonc"
SCHEMA_FILE="backend/schema.sql"

# Project names for Cloudflare Pages
LANDING_PAGE_PROJECT="fisioreport-landing"
SAAS_APP_PROJECT="fisioreport-app"

deploy() {
    echo "🚀 Iniciando deploy global da infraestrutura Cloudflare..."

    # 1. Banco de Dados D1
    echo "--- [1/4] Banco de Dados ---"
    npx wrangler d1 create $DB_NAME 2>/dev/null
    DB_ID=$(npx wrangler d1 info $DB_NAME --json | grep -o '"uuid": "[^"]*"' | head -1 | cut -d'"' -f4)

    if [ -z "$DB_ID" ]; then
        echo "❌ Erro: Não foi possível obter o ID do banco de dados."
        exit 1
    fi

    echo "✅ Database ID: $DB_ID"

    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/\"database_id\": \".*\"/\"database_id\": \"$DB_ID\"/" $CONFIG_FILE
    else
        sed -i "s/\"database_id\": \".*\"/\"database_id\": \"$DB_ID\"/" $CONFIG_FILE
    fi

    echo "📄 Aplicando schema..."
    npx wrangler d1 execute $DB_NAME --remote --file=$SCHEMA_FILE --yes

    # 2. Backend (Worker)
    echo "--- [2/4] Backend (Worker) ---"
    cd backend && npx wrangler deploy && cd ..

    # 3. Landing Page (Pages)
    echo "--- [3/4] Landing Page ---"
    cd src-landing-page
    npm install && npm run build
    npx wrangler pages deploy dist --project-name $LANDING_PAGE_PROJECT
    cd ..

    # 4. SaaS App (Pages)
    echo "--- [4/4] SaaS Application ---"
    # O SaaS app está na raiz
    npm install && npm run build
    npx wrangler pages deploy dist --project-name $SAAS_APP_PROJECT

    echo "🎉 Deploy global concluído com sucesso!"
    echo "🔗 Landing Page: https://$LANDING_PAGE_PROJECT.pages.dev"
    echo "🔗 SaaS App: https://$SAAS_APP_PROJECT.pages.dev"
}

destroy() {
    echo "⚠️  Destruindo toda a infraestrutura Cloudflare..."

    echo "🗑️ Removendo Banco D1..."
    npx wrangler d1 delete $DB_NAME

    echo "🗑️ Removendo Worker..."
    cd backend && npx wrangler delete && cd ..

    echo "🗑️ Removendo Projetos Pages..."
    npx wrangler pages project delete $LANDING_PAGE_PROJECT --yes
    npx wrangler pages project delete $SAAS_APP_PROJECT --yes

    # Reseta o placeholder
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/\"database_id\": \".*\"/\"database_id\": \"PLACEHOLDER_DATABASE_ID\"/" $CONFIG_FILE
    else
        sed -i "s/\"database_id\": \".*\"/\"database_id\": \"PLACEHOLDER_DATABASE_ID\"/" $CONFIG_FILE
    fi

    echo "🔥 Infraestrutura completamente removida."
}

sync_database() {
    echo "🔄 Sincronizando dados do banco de dados..."
    # Sincroniza o que quer que esteja no banco remoto para o local

    BACKUP_FILE="backup_$(date +%s).sql"

    echo "📂 Entrando no diretório backend..."
    cd backend

    echo "⬇️  Exportando dados do ambiente remoto para $BACKUP_FILE..."
    # Exporta schema e dados do remoto
    npx wrangler d1 export $DB_NAME --remote --output=$BACKUP_FILE

    if [ ! -f "$BACKUP_FILE" ]; then
        echo "❌ Erro: Falha ao exportar o banco de dados. Verifique suas credenciais e o arquivo wrangler.jsonc."
        cd ..
        exit 1
    fi

    echo "🧹 Limpando banco de dados local antigo (.wrangler/state/v3/d1)..."
    # Remove estado local para garantir sincronização limpa (substituição total)
    rm -rf .wrangler/state/v3/d1

    echo "⬆️  Importando dados para o ambiente local..."
    npx wrangler d1 execute $DB_NAME --local --file=$BACKUP_FILE --yes

    echo "🗑️ Removendo arquivo temporário de backup..."
    rm $BACKUP_FILE

    cd ..

    echo "✅ Sincronização concluída com sucesso."
}

case "$1" in
    deploy) deploy ;;
    destroy) destroy ;;
    sync) sync_database ;;
    *) echo "Uso: $0 {deploy|destroy|sync}" ;;
esac
