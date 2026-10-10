#!/bin/sh

set -eu

VAULT_ADDR="${VAULT_ADDR:-https://vault:8200}"
VAULT_TOKEN_FILE="${VAULT_TOKEN_FILE:-/vault/secrets/backend_token.txt}"

echo "Waiting for Vault token..."
attempt=0
while [ ! -s "$VAULT_TOKEN_FILE" ]; do
    attempt=$((attempt + 1))
    if [ "$attempt" -ge 60 ]; then
        echo "ERROR: Vault token was not created within 60 seconds." >&2
        exit 1
    fi
    sleep 1
done

TOKEN="$(cat "$VAULT_TOKEN_FILE")"
SECRETS="$(curl --fail --silent --show-error --connect-timeout 3 --max-time 10 \
    --cacert "${VAULT_CACERT:-/vault/certs/ca.crt}" \
    -H "X-Vault-Token: $TOKEN" \
    "$VAULT_ADDR/v1/secret/data/backend")"
unset TOKEN


DATABASE_URL="$(printf '%s' "$SECRETS" | node -e 'let input=""; process.stdin.on("data", chunk => input += chunk); process.stdin.on("end", () => { const value = JSON.parse(input).data.data.database_url; if (!value) process.exit(1); process.stdout.write(value); });')"
JWT_SECRET="$(printf '%s' "$SECRETS" | node -e 'let input=""; process.stdin.on("data", chunk => input += chunk); process.stdin.on("end", () => { const value = JSON.parse(input).data.data.jwt_secret; if (!value) process.exit(1); process.stdout.write(value); });')"
unset SECRETS
export DATABASE_URL JWT_SECRET

echo "Vault secrets loaded."

if [ -z "${1:-}" ] || [ "${1:-}" = "npm" ]; then
    echo "Running Prisma schema sync..."
    npx prisma db push
fi

if [ "$#" -gt 0 ]; then
    exec "$@"
else
    exec npm run start:dev
fi

