#!/bin/sh
set -eu
umask 077

export VAULT_ADDR="${VAULT_ADDR:-https://127.0.0.1:8200}"
export VAULT_CACERT="${VAULT_CACERT:-/vault/tls/vault.crt}"
BOOTSTRAP_DB_USER="${DB_USER:?DB_USER est requis pour l'initialisation PostgreSQL}"
BOOTSTRAP_DB_PASSWORD="${DB_PASSWORD:?DB_PASSWORD est requis pour l'initialisation PostgreSQL}"
BOOTSTRAP_DB_NAME="${DB_NAME:?DB_NAME est requis pour l'initialisation PostgreSQL}"
BOOTSTRAP_PUBLIC_API_KEY="${PUBLIC_API_KEY:-dev-public-api-key-change-me}"
BOOTSTRAP_BACKUP_KEY="${BACKUP_ENCRYPTION_KEY:-}"
BOOTSTRAP_GMAIL_APP_PASSWORD="${GMAIL_APP_PASSWORD:-}"
unset DB_USER DB_PASSWORD DB_NAME PUBLIC_API_KEY BACKUP_ENCRYPTION_KEY GMAIL_APP_PASSWORD
VAULT_PID=""

shutdown() {
    if [ -n "$VAULT_PID" ] && kill -0 "$VAULT_PID" 2>/dev/null; then
        kill "$VAULT_PID" 2>/dev/null || true
        wait "$VAULT_PID" 2>/dev/null || true
    fi
}
trap shutdown HUP INT TERM

vault server -config=/vault/config/vault.conf &
VAULT_PID=$!

echo "Waiting for Vault API..."
attempt=0
while :; do
    if ! kill -0 "$VAULT_PID" 2>/dev/null; then
        echo "ERROR: Vault server exited before becoming ready." >&2
        wait "$VAULT_PID" || true
        exit 1
    fi

    STATUS="$(vault status 2>&1 || true)"
    if printf '%s\n' "$STATUS" | grep -q 'Sealed'; then
        break
    fi

    attempt=$((attempt + 1))
    if [ "$attempt" -ge 60 ]; then
        echo "ERROR: Vault API did not become ready within 60 seconds." >&2
        printf '%s\n' "$STATUS" >&2
        exit 1
    fi
    sleep 1
done

KEY_FILE="/vault/keys/keys.txt"
if [ ! -s "$KEY_FILE" ]; then
    if [ -s /vault/file/keys.txt ]; then
        cp /vault/file/keys.txt "$KEY_FILE.tmp"
        rm -f /vault/file/keys.txt
    else
        echo "Initializing Vault..."
        vault operator init -key-shares=3 -key-threshold=2 > "$KEY_FILE.tmp"
    fi
    chmod 0400 "$KEY_FILE.tmp"
    mv "$KEY_FILE.tmp" "$KEY_FILE"
fi

UNSEAL_KEY1="$(awk '/Unseal Key 1:/ {print $4}' "$KEY_FILE")"
UNSEAL_KEY2="$(awk '/Unseal Key 2:/ {print $4}' "$KEY_FILE")"
ROOT_TOKEN="$(awk '/Initial Root Token:/ {print $4}' "$KEY_FILE")"
if [ -z "$UNSEAL_KEY1" ] || [ -z "$UNSEAL_KEY2" ] || [ -z "$ROOT_TOKEN" ]; then
    echo "ERROR: Vault initialization file is incomplete." >&2
    exit 1
fi

echo "Unsealing Vault..."
vault operator unseal "$UNSEAL_KEY1" >/dev/null
vault operator unseal "$UNSEAL_KEY2" >/dev/null
export VAULT_TOKEN="$ROOT_TOKEN"

if ! vault secrets list -format=json | grep -q '"secret/"'; then
    vault secrets enable -path=secret kv-v2
fi

if JWT_SECRET="$(vault kv get -field=jwt_secret secret/backend 2>/dev/null)"; then
    :
else
    JWT_SECRET="$(od -An -N32 -tx1 /dev/urandom | tr -d ' \n')"
fi

vault kv put secret/backend \
    "database_url=postgresql://${BOOTSTRAP_DB_USER}:${BOOTSTRAP_DB_PASSWORD}@database:5432/${BOOTSTRAP_DB_NAME}" \
    "jwt_secret=${JWT_SECRET}" \
    "public_api_key=${BOOTSTRAP_PUBLIC_API_KEY}" >/dev/null

vault kv put secret/runtime/database \
    "db_user=${BOOTSTRAP_DB_USER}" \
    "db_password=${BOOTSTRAP_DB_PASSWORD}" \
    "db_name=${BOOTSTRAP_DB_NAME}" >/dev/null

if ! vault kv get -field=backup_encryption_key secret/runtime/backup >/dev/null 2>&1; then
    if [ -z "$BOOTSTRAP_BACKUP_KEY" ]; then
        echo "ERROR: BACKUP_ENCRYPTION_KEY is required to initialize backup secrets." >&2
        exit 1
    fi
    vault kv put secret/runtime/backup \
        "backup_encryption_key=${BOOTSTRAP_BACKUP_KEY}" >/dev/null
fi

if ! vault kv get -field=admin_password secret/runtime/grafana >/dev/null 2>&1; then
    GRAFANA_ADMIN_PASSWORD="$(od -An -N32 -tx1 /dev/urandom | tr -d ' \n')"
    vault kv put secret/runtime/grafana \
        "admin_user=admin" \
        "admin_password=${GRAFANA_ADMIN_PASSWORD}" >/dev/null
    unset GRAFANA_ADMIN_PASSWORD
fi

# Importer le mot de passe d'application Gmail dans Vault au premier provisionnement ou à sa rotation.
if [ -n "$BOOTSTRAP_GMAIL_APP_PASSWORD" ]; then
    vault kv put secret/runtime/alertmanager \
        "gmail_app_password=${BOOTSTRAP_GMAIL_APP_PASSWORD}" >/dev/null
elif ! vault kv get -field=gmail_app_password secret/runtime/alertmanager >/dev/null 2>&1; then
    echo "WARNING: Gmail alert delivery is not configured; set GMAIL_APP_PASSWORD in .env and restart Vault." >&2
fi

write_secret_file() {
    vault kv get -field="$2" "$3" > "$1"
    chmod 0444 "$1"
}

write_secret_file /vault/runtime/status/db_user db_user secret/runtime/database
write_secret_file /vault/runtime/status/db_password db_password secret/runtime/database
write_secret_file /vault/runtime/status/db_name db_name secret/runtime/database
write_secret_file /vault/runtime/backup/db_user db_user secret/runtime/database
write_secret_file /vault/runtime/backup/db_password db_password secret/runtime/database
write_secret_file /vault/runtime/backup/db_name db_name secret/runtime/database
write_secret_file /vault/runtime/backup/backup_encryption_key backup_encryption_key secret/runtime/backup
write_secret_file /vault/runtime/exporter/data_source_user db_user secret/runtime/database
write_secret_file /vault/runtime/exporter/data_source_password db_password secret/runtime/database
printf 'database:5432/%s?sslmode=disable\n' "$(vault kv get -field=db_name secret/runtime/database)" > /vault/runtime/exporter/data_source_uri
chmod 0444 /vault/runtime/exporter/data_source_uri
write_secret_file /vault/runtime/grafana/admin_user admin_user secret/runtime/grafana
write_secret_file /vault/runtime/grafana/admin_password admin_password secret/runtime/grafana
if vault kv get -field=gmail_app_password secret/runtime/alertmanager >/dev/null 2>&1; then
    write_secret_file /vault/runtime/alertmanager/gmail_app_password gmail_app_password secret/runtime/alertmanager
fi

vault policy write backend-policy - <<'EOF'
path "secret/data/backend" {
  capabilities = ["read"]
}
EOF

mkdir -p /vault/token
if [ -s /vault/token/backend_token.txt ]; then
    OLD_BACKEND_TOKEN="$(cat /vault/token/backend_token.txt)"
    vault token revoke "$OLD_BACKEND_TOKEN" >/dev/null 2>&1 || true
fi
BACKEND_TOKEN="$(vault token create -policy=backend-policy -field=token)"
printf '%s\n' "$BACKEND_TOKEN" > /vault/token/backend_token.txt
chmod 0440 /vault/token/backend_token.txt
unset VAULT_TOKEN ROOT_TOKEN UNSEAL_KEY1 UNSEAL_KEY2 BACKEND_TOKEN OLD_BACKEND_TOKEN JWT_SECRET BOOTSTRAP_DB_USER BOOTSTRAP_DB_PASSWORD BOOTSTRAP_DB_NAME BOOTSTRAP_PUBLIC_API_KEY BOOTSTRAP_BACKUP_KEY BOOTSTRAP_GMAIL_APP_PASSWORD

echo "Vault initialized, unsealed, and ready."
wait "$VAULT_PID"
