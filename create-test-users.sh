#!/bin/bash
# Script de creation rapide de 4 comptes de test, avec profils remplis
# Usage : bash create-test-users.sh

BASE_URL="https://localhost:8443/api"
CURL="curl -k -s"

declare -a EMAILS=("alice@test.com" "bob@test.com" "charlie@test.com" "diana@test.com")
declare -a NAMES=("Alice" "Bob" "Charlie" "Diana")
declare -a USERNAMES=("alice_test" "bob_test" "charlie_test" "diana_test")
declare -a KINDS=("woman" "man" "man" "woman")
declare -a BIRTHDAYS=("1998-05-12" "1997-08-23" "1995-03-15" "1999-11-02")

declare -a TOKENS=()
declare -a IDS=()

for i in 0 1 2 3; do
    email="${EMAILS[$i]}"
    name="${NAMES[$i]}"
    username="${USERNAMES[$i]}"
    kind="${KINDS[$i]}"
    birthday="${BIRTHDAYS[$i]}"

    echo "== Creation du compte : $name =="
    RES=$($CURL -X POST "$BASE_URL/auth/register" \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"$email\",\"password\":\"motdepasse123\",\"validatePassword\":\"motdepasse123\"}")
    echo "$RES"
    TOKEN=$(echo "$RES" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

    if [ -z "$TOKEN" ]; then
        echo "-> Compte deja existant, connexion a la place"
        RES=$($CURL -X POST "$BASE_URL/auth/login" \
          -H "Content-Type: application/json" \
          -d "{\"email\":\"$email\",\"password\":\"motdepasse123\"}")
        TOKEN=$(echo "$RES" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    fi

    echo "Token $name : $TOKEN"
    TOKENS+=("$TOKEN")

    $CURL -X POST "$BASE_URL/users/createProfile" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "{\"name\":\"$name\",\"username\":\"$username\",\"birthday\":\"$birthday\",\"kind\":\"$kind\",\"orientation\":\"all\",\"biography\":\"Compte de test $name\"}"
    echo ""

    ME=$($CURL -X GET "$BASE_URL/users/me" -H "Authorization: Bearer $TOKEN")
    ID=$(echo "$ME" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    echo "Id $name : $ID"
    IDS+=("$ID")

    echo ""
done

echo "======================================"
echo "Comptes prets :"
for i in 0 1 2 3; do
    echo "  ${EMAILS[$i]} / motdepasse123 (id=${IDS[$i]})"
done
echo "======================================"
echo ""
echo "Aucun match cree automatiquement cette fois - likez-vous manuellement"
echo "pour tester le scenario 'match pas sur le dernier profil de la liste'."
echo ""
echo "Exemple pour creer un match entre Alice et Bob :"
echo "curl -k -s -X POST $BASE_URL/match/validate -H \"Content-Type: application/json\" -H \"Authorization: Bearer ${TOKENS[0]}\" -d '{\"userId\":${IDS[1]},\"status\":\"like\"}'"
echo "curl -k -s -X POST $BASE_URL/match/validate -H \"Content-Type: application/json\" -H \"Authorization: Bearer ${TOKENS[1]}\" -d '{\"userId\":${IDS[0]},\"status\":\"like\"}'"
