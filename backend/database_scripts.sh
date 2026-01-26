#!/bin/bash

set -e
ROOT_FOLDER=$(dirname $0)
cd $ROOT_FOLDER

DB_NAME="fisioreport-db"
SCHEMA_FILE="./schema.sql"
SEED_FILE="./seed.sql"

usage() {
    echo "Usage: $0 --action [deploy|migrate|seed|delete] [--local|--remote]"
    echo ""
    echo "Actions:"
    echo "  deploy   - Creates the database (if remote) and applies the initial schema"
    echo "  migrate  - Applies the schema.sql file to the database"
    echo "  seed     - Populates the database with mock data from seed.sql"
    echo "  delete   - Deletes the remote database"
    echo ""
    echo "Targets:"
    echo "  --local  - Target the local development environment"
    echo "  --remote - Target the Cloudflare production environment"
    exit 1
}

ACTION=""
TARGET=""

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --action) ACTION="$2"; shift ;;
        --local) TARGET="local" ;;
        --remote) TARGET="remote" ;;
        *) usage ;;
    esac
    shift
done

if [[ -z "$ACTION" ]] || [[ -z "$TARGET" ]]; then
    usage
fi

case $ACTION in
    deploy)
        if [[ "$TARGET" == "local" ]]; then
            echo "🚀 Deploying local database..."
            npx wrangler d1 execute $DB_NAME --local --file=$SCHEMA_FILE
        else
            echo "🚀 Creating remote database..."
            npx wrangler d1 create $DB_NAME
            echo "📄 Applying schema to remote database..."
            npx wrangler d1 execute $DB_NAME --remote --file=$SCHEMA_FILE
        fi
        ;;
    
    migrate)
        if [[ "$TARGET" == "local" ]]; then
            echo "🔄 Migrating local database..."
            npx wrangler d1 execute $DB_NAME --local --file=$SCHEMA_FILE
        else
            echo "🔄 Migrating remote database..."
            npx wrangler d1 execute $DB_NAME --remote --file=$SCHEMA_FILE
        fi
        ;;

    seed)
        if [[ "$TARGET" == "local" ]]; then
            echo "🌱 Seeding local database..."
            npx wrangler d1 execute $DB_NAME --local --file=$SEED_FILE
        else
            echo "🌱 Seeding remote database..."
            npx wrangler d1 execute $DB_NAME --remote --file=$SEED_FILE
        fi
        ;;

    delete)        if [[ "$TARGET" == "remote" ]]; then
            echo "⚠️  Deleting remote database..."
            npx wrangler d1 delete $DB_NAME
        else
            echo "❌ Deletion is only supported for --remote via this script."
            echo "   To reset local, delete the .wrangler/state directory."
        fi
        ;;

    *)
        usage
        ;;
esac
