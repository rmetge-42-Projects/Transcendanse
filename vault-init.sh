#!/bin/sh

vault server -config=/vault/config/vault.conf &
VAULT_PID=$!

export VAULT_ADDR='https://127.0.0.1:8200'
export VAULT_SKIP_VERIFY=true

while ! vault status 2>&1 | grep -q "Sealed"; do sleep 1; done

if [ ! -f /vault/file/keys.txt ]; then
    echo "Initializing Vault..."
    
    vault operator init -key-shares=3 -key-threshold=2 > /vault/file/keys.txt
    chmod 600 /vault/file/keys.txt

    UNSEAL_KEY1=$(grep 'Unseal Key 1:' /vault/file/keys.txt | awk '{print $4}')
    UNSEAL_KEY2=$(grep 'Unseal Key 2:' /vault/file/keys.txt | awk '{print $4}')
    ROOT_TOKEN=$(grep 'Initial Root Token:' /vault/file/keys.txt | awk '{print $4}')

    echo "Unsealing Vault..."
    vault operator unseal "$UNSEAL_KEY1"
    vault operator unseal "$UNSEAL_KEY2"

    echo "Logging in..."
    vault login "$ROOT_TOKEN"

    echo "Enabling KV secrets engine and storing backend secrets..."
    vault secrets enable -path=secret kv-v2

    vault kv put secret/backend \
      database_url="postgresql://${DB_USER}:${DB_PASSWORD}@database:5432/${DB_NAME}" \
      jwt_secret="${JWT_SECRET}"

    echo "Creating backend policy..."
    vault policy write backend-policy - <<EOF
path "secret/data/backend" {
  capabilities = ["read"]
}
EOF

echo "Generating restricted backend token..."
BACKEND_TOKEN=$(vault token create -policy="backend-policy" -field=token)

mkdir -p /vault/data

echo "$BACKEND_TOKEN" > /vault/data/backend_token.txt
chmod 600 /vault/data/backend_token.txt

else
    echo "Vault is already initialized. Unsealing..."
    UNSEAL_KEY1=$(grep 'Unseal Key 1:' /vault/file/keys.txt | awk '{print $4}')
    UNSEAL_KEY2=$(grep 'Unseal Key 2:' /vault/file/keys.txt | awk '{print $4}')
    vault operator unseal "$UNSEAL_KEY1"
    vault operator unseal "$UNSEAL_KEY2"
fi

echo "Vault is ready."
wait $VAULT_PID
