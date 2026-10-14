#!/bin/bash
mkdir -p secrets/nginx-certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout secrets/nginx-certs/transcendance.key \
    -out secrets/nginx-certs/transcendance.crt \
    -subj "/C=FR/ST=Occitanie/L=Toulouse/O=42/OU=DevSecOps/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,DNS:transcendance42.fr,IP:127.0.0.1"
chmod 600 secrets/nginx-certs/transcendance.key
