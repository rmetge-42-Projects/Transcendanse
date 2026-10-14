#!/bin/sh
set -eu

export VAULT_ADDR="${VAULT_ADDR:-http://127.0.0.1:8200}"

SECRETS_DIR="${VAULT_SECRETS_DIR:-/vault/secrets}"
KEYS_FILE="$SECRETS_DIR/keys.txt"
TOKEN_FILE="$SECRETS_DIR/backend_token.txt"

mkdir -p "$SECRETS_DIR"

vault server -config=/vault/config/vault.conf &
VAULT_PID=$!

cleanup() {
    kill "$VAULT_PID" 2>/dev/null || true
    wait "$VAULT_PID" 2>/dev/null || true
}

trap cleanup INT TERM

read_status() {
    set +e
    STATUS_OUTPUT=$(vault status 2>&1)
    STATUS_CODE=$?
    set -e

    INITIALIZED=$(printf '%s\n' "$STATUS_OUTPUT" | awk '$1 == "Initialized" { print $2 }')
    SEALED=$(printf '%s\n' "$STATUS_OUTPUT" | awk '$1 == "Sealed" { print $2 }')
}

wait_for_vault() {
    attempts=0

    while :; do
        read_status
        if [ -n "$INITIALIZED" ]; then
            return 0
        fi

        attempts=$((attempts + 1))
        if [ "$attempts" -ge 30 ]; then
            echo "Vault did not start in time." >&2
            printf '%s\n' "$STATUS_OUTPUT" >&2
            exit 1
        fi

        sleep 1
    done
}

require_env() {
    variable_name="$1"
    eval "variable_value=\${$variable_name:-}"

    if [ -z "$variable_value" ]; then
        echo "$variable_name is missing. Check your .env file." >&2
        exit 1
    fi
}

wait_for_vault

if [ "$INITIALIZED" != "true" ]; then
    echo "Initializing Vault..."
    INIT_FILE="$KEYS_FILE.tmp"
    rm -f "$INIT_FILE"
    vault operator init -key-shares=1 -key-threshold=1 > "$INIT_FILE"
    mv "$INIT_FILE" "$KEYS_FILE"
else
    echo "Vault is already initialized."
fi

if [ ! -s "$KEYS_FILE" ]; then
    echo "Vault is initialized, but $KEYS_FILE is missing." >&2
    echo "The existing Vault data cannot be unsealed without its original key." >&2
    echo "For a local reset, remove the Vault data and secret volumes, then restart Compose." >&2
    exit 1
fi

UNSEAL_KEY=$(awk -F': ' '/Unseal Key 1:/ { print $2 }' "$KEYS_FILE")
ROOT_TOKEN=$(awk -F': ' '/Initial Root Token:/ { print $2 }' "$KEYS_FILE")

if [ -z "$UNSEAL_KEY" ] || [ -z "$ROOT_TOKEN" ]; then
    echo "Could not read the Vault unseal key or root token from $KEYS_FILE." >&2
    exit 1
fi

read_status
if [ "$SEALED" = "true" ]; then
    echo "Unsealing Vault..."
    vault operator unseal "$UNSEAL_KEY" >/dev/null
fi

echo "Logging in..."
vault login "$ROOT_TOKEN" >/dev/null

require_env DB_USER
require_env DB_PASSWORD
require_env DB_NAME
require_env JWT_SECRET
PUBLIC_API_KEY="${PUBLIC_API_KEY:-dev-public-api-key-change-me}"

echo "Enabling KV secrets engine and storing backend secrets..."
if vault secrets list 2>/dev/null | awk '{ print $1 }' | grep -qx 'secret/'; then
    echo "KV secrets engine already enabled."
else
    vault secrets enable -path=secret kv-v2 >/dev/null
fi
vault kv put secret/backend \
    database_url="postgresql://${DB_USER}:${DB_PASSWORD}@database:5432/${DB_NAME}" \
    jwt_secret="${JWT_SECRET}" \
    public_api_key="${PUBLIC_API_KEY}" >/dev/null

printf '%s\n' "$ROOT_TOKEN" > "$TOKEN_FILE"
chmod 600 "$KEYS_FILE" "$TOKEN_FILE" 2>/dev/null || true

echo "Vault is ready."
wait "$VAULT_PID"
