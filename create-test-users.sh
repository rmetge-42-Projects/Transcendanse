#!/bin/bash
# Cree 15 comptes de test : user1@test.com ... user15@test.com
# Mot de passe de tous les comptes : motdepasse123
# Prepare aussi quelques matchs, des likes en attente et deux premiers messages.
# Usage : bash create-test-users-15.sh

BASE_URL="https://localhost:8443/api"
PASSWORD="motdepasse123"
COUNT=15

TOKENS=()
IDS=()
KINDS=("woman" "man" "non_binary")

extract_token() {
    echo "$1" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4
}

# like <numero de celui qui like> <numero de celui qui est like>
like() {
    local from=$1
    local to=$2
    local result

    if [ -z "${TOKENS[$from]}" ] || [ -z "${IDS[$to]}" ]; then
        echo "  user$from -> user$to : ignore (compte manquant)"
        return
    fi

    result=$(curl -k -s -X POST "$BASE_URL/match/validate" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${TOKENS[$from]}" \
        -d "{\"userId\":${IDS[$to]},\"status\":\"like\"}")

    if echo "$result" | grep -q '"match":true'; then
        echo "  user$from -> user$to : MATCH"
    elif echo "$result" | grep -q '"match":false'; then
        echo "  user$from -> user$to : like envoye"
    else
        echo "  user$from -> user$to : $result"
    fi
}

# send_message <numero de l'expediteur> <numero du destinataire> <texte>
send_message() {
    local from=$1
    local to=$2
    local text=$3
    local result

    if [ -z "${TOKENS[$from]}" ] || [ -z "${IDS[$to]}" ]; then
        echo "  user$from -> user$to : message ignore (compte manquant)"
        return
    fi

    result=$(curl -k -s -X POST "$BASE_URL/message/sendMessage" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${TOKENS[$from]}" \
        -d "{\"receiveId\":${IDS[$to]},\"message\":\"$text\"}")

    if echo "$result" | grep -q '"content"'; then
        echo "  user$from -> user$to : message envoye"
    else
        echo "  user$from -> user$to : $result"
    fi
}

echo "== Creation des $COUNT comptes =="
for i in $(seq 1 $COUNT); do
    email="user$i@test.com"
    kind=${KINDS[$((i % 3))]}
    birthday=$(printf "%d-%02d-%02d" $((1990 + i % 10)) $((1 + i % 12)) $((1 + i % 28)))

    RES=$(curl -k -s -X POST "$BASE_URL/auth/register" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$PASSWORD\",\"validatePassword\":\"$PASSWORD\"}")
    TOKEN=$(extract_token "$RES")

    # Compte deja existant : on se connecte a la place
    if [ -z "$TOKEN" ]; then
        RES=$(curl -k -s -X POST "$BASE_URL/auth/login" \
            -H "Content-Type: application/json" \
            -d "{\"email\":\"$email\",\"password\":\"$PASSWORD\"}")
        TOKEN=$(extract_token "$RES")
    fi

    if [ -z "$TOKEN" ]; then
        echo "  $email : ECHEC de connexion ($RES)"
        continue
    fi
    TOKENS[$i]="$TOKEN"

    PROFILE=$(curl -k -s -X POST "$BASE_URL/users/createProfile" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d "{\"name\":\"User$i\",\"username\":\"user$i\",\"birthday\":\"$birthday\",\"kind\":\"$kind\",\"orientation\":\"all\",\"biography\":\"Compte de test user$i\"}")

    ME=$(curl -k -s -X GET "$BASE_URL/users/me" -H "Authorization: Bearer $TOKEN")
    IDS[$i]=$(echo "$ME" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

    if echo "$PROFILE" | grep -q '"statusCode"'; then
        echo "  $email : compte OK (id=${IDS[$i]}) mais profil refuse : $PROFILE"
    else
        echo "  $email : OK (id=${IDS[$i]}, $kind)"
    fi
done

echo ""
echo "== Matchs (likes reciproques) =="
MATCHES=("1 2" "3 4" "5 6" "7 8" "9 10" "1 3" "2 4" "11 12")
for pair in "${MATCHES[@]}"; do
    a=${pair% *}
    b=${pair#* }
    like $a $b
    like $b $a
done

echo ""
echo "== Likes en attente (un seul sens) =="
PENDING=("13 1" "14 1" "15 2")
for pair in "${PENDING[@]}"; do
    a=${pair% *}
    b=${pair#* }
    like $a $b
done

echo ""
echo "== Premiers messages (2 matchs seulement) =="
send_message 1 2 "Salut, ca va ?"
send_message 6 5 "Hello !"

echo ""
echo "======================================"
echo "Comptes : user1@test.com ... user$COUNT@test.com"
echo "Mot de passe : $PASSWORD"
echo ""
echo "Matchs avec message      : user1-user2, user5-user6"
echo "Matchs 'Nouveau match !' : user3-user4, user7-user8, user9-user10,"
echo "                           user1-user3, user2-user4, user11-user12"
echo "Likes en attente         : user13 -> user1, user14 -> user1, user15 -> user2"
echo "                           (quand user1 ou user2 like en retour : MATCH)"
echo "======================================"