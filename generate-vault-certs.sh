#!/bin/bash
set -euo pipefail

mkdir -p vault-certs
rm -f vault-certs/vault.key vault-certs/vault.crt
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout vault-certs/vault.key \
    -out vault-certs/vault.crt \
    -subj "/C=FR/ST=Occitanie/L=Toulouse/O=42/OU=DevSecOps/CN=vault" \
    -addext "subjectAltName=DNS:vault,IP:127.0.0.1" \
    -addext "basicConstraints=critical,CA:TRUE" \
    -addext "keyUsage=critical,digitalSignature,keyEncipherment,keyCertSign" \
    -addext "extendedKeyUsage=serverAuth"
chmod 600 vault-certs/vault.key
