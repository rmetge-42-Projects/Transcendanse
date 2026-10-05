#!/bin/sh

vault server -config=/vault/config/vault.conf &
VAULT_PID=$!

export VAULT_ADDR='http://127.0.0.1:8200'

sleep 3

if [ ! -f /vault/file/keys.txt ]; then
    echo "Initializing Vault..."

    
    vault operator init -key-shares=1 -key-threshold=1 > /vault/file/keys.txt

    UNSEAL_KEY=$(grep 'Unseal Key 1:' /vault/file/keys.txt | awk '{print $4}')
    ROOT_TOKEN=$(grep 'Initial Root Token:' /vault/file/keys.txt | awk '{print $4}')

    echo "Unsealing Vault..."
    vault operator unseal $UNSEAL_KEY

    echo "Logging in..."
    vault login $ROOT_TOKEN

    echo "Enabling KV secrets engine and storing backend secrets..."
    vault secrets enable -path=secret kv-v2

    vault kv put secret/backend \
      database_url="postgresql://${DB_USER}:${DB_PASSWORD}@database:5432/${DB_NAME}" \
      jwt_secret="${JWT_SECRET}"
else
    echo "Vault is already initialized. Unsealing..."
    UNSEAL_KEY=$(grep 'Unseal Key 1:' /vault/file/keys.txt | awk '{print $4}')
    vault operator unseal $UNSEAL_KEY
fi

echo "Vault is ready."
echo $ROOT_TOKEN > /vault/file/backend_token.txt
wait $VAULT_PID
