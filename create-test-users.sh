#!/bin/bash
# Script de creation rapide de 2 comptes de test, avec profils remplis
# Usage : bash create-test-users.sh
# Adapte l'URL de base si besoin (port, http/https)

BASE_URL="https://localhost:8443/api"
CURL="curl -k -s"

echo "== Creation du compte A (Alice) =="
RES_A=$($CURL -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"motdepasse123","validatePassword":"motdepasse123"}')
echo "$RES_A"
TOKEN_A=$(echo "$RES_A" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

echo ""
echo "== Creation du compte B (Bob) =="
RES_B=$($CURL -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@test.com","password":"motdepasse123","validatePassword":"motdepasse123"}')
echo "$RES_B"
TOKEN_B=$(echo "$RES_B" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

echo ""
echo "== Si les comptes existaient deja, connexion a la place =="
if [ -z "$TOKEN_A" ]; then
  RES_A=$($CURL -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"alice@test.com","password":"motdepasse123"}')
  TOKEN_A=$(echo "$RES_A" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
fi
if [ -z "$TOKEN_B" ]; then
  RES_B=$($CURL -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"bob@test.com","password":"motdepasse123"}')
  TOKEN_B=$(echo "$RES_B" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
fi

echo "Token Alice : $TOKEN_A"
echo "Token Bob   : $TOKEN_B"

echo ""
echo "== Remplissage du profil d'Alice =="
$CURL -X POST "$BASE_URL/users/createProfile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_A" \
  -d '{"name":"Alice","username":"alice_test","birthday":"1998-05-12","kind":"woman","orientation":"all","biography":"Compte de test Alice"}'
echo ""

echo "== Remplissage du profil de Bob =="
$CURL -X POST "$BASE_URL/users/createProfile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_B" \
  -d '{"name":"Bob","username":"bob_test","birthday":"1997-08-23","kind":"man","orientation":"all","biography":"Compte de test Bob"}'
echo ""

echo ""
echo "== Recuperation des ids via /users/me =="
ME_A=$($CURL -X GET "$BASE_URL/users/me" -H "Authorization: Bearer $TOKEN_A")
ME_B=$($CURL -X GET "$BASE_URL/users/me" -H "Authorization: Bearer $TOKEN_B")
ID_A=$(echo "$ME_A" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
ID_B=$(echo "$ME_B" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "Id Alice : $ID_A"
echo "Id Bob   : $ID_B"

echo ""
echo "== Tentative de creation d'un match (adapte le endpoint/payload si besoin) =="
echo "-> Verifie dans match.controller.ts le nom exact de la route et le format attendu."
$CURL -X POST "$BASE_URL/match/validate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_A" \
  -d "{\"userId\":$ID_B}"
echo ""
$CURL -X POST "$BASE_URL/match/validate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_B" \
  -d "{\"userId\":$ID_A}"
echo ""

echo ""
echo "======================================"
echo "Comptes prets :"
echo "  alice@test.com / motdepasse123 (id=$ID_A)"
echo "  bob@test.com   / motdepasse123 (id=$ID_B)"
echo "======================================"