#!/bin/sh
set -e

echo "Waiting for Vault to initialize..."
sleep 5

TOKEN=$(cat /vault/secrets/backend_token.txt)
SECRETS=$(curl -s -H "X-Vault-Token: $TOKEN" http://vault:8200/v1/secret/data/backend)

export DATABASE_URL=$(node -pe "JSON.parse(process.argv[1]).data.data.database_url" "$SECRETS")
export JWT_SECRET=$(node -pe "JSON.parse(process.argv[1]).data.data.jwt_secret" "$SECRETS")

echo "Secrets loaded successfully."

if [ -z "$1" ] || [ "$1" = "npm" ]; then
    echo "Running Prisma migrations..."
    npx prisma db push
fi

if [ $# -gt 0 ]; then
    echo "Executing command: $@"
    exec "$@"
else
    echo "Starting NestJS Server..."
    exec npm run start:dev
fi