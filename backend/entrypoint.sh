#!/bin/sh
set -e

echo "Waiting for Vault to initialize..."
sleep 5

TOKEN=$(cat /vault/secrets/backend_token.txt)

SECRETS=$(curl -s -H "X-Vault-Token: $TOKEN" http://vault:8200/v1/secret/data/backend)

export DATABASE_URL=$(node -pe "JSON.parse(process.argv[1]).data.data.database_url" "$SECRETS")
export JWT_SECRET=$(node -pe "JSON.parse(process.argv[1]).data.data.jwt_secret" "$SECRETS")

echo "Secrets loaded successfully."

echo "Running Prisma migrations..."
npx prisma db push

echo "Starting NestJS Server..."
exec npm run start:dev