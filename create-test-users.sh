#!/bin/bash
# Cree 15 comptes de test : user1@test.com ... user15@test.com
# Mot de passe de tous les comptes : motdepasse123
# Prepare aussi quelques matchs, des likes en attente et deux premiers messages.
# Usage : bash create-test-users-15.sh

BASE_URL="${BASE_URL:-https://localhost:8443/api}"
PASSWORD="motdepasse123"
COUNT=15

TOKENS=()
IDS=()
FAILED=0
KINDS=("woman" "man" "non_binary")

NAMES=("Maya" "Noah" "Leila" "Sami" "Clara" "Kenji" "Iris" "Leo" "Lina" "Adam" "Naima" "Robin" "Hana" "Malik" "Zoe")

USERNAMES=("maya_dance" "noah_moves" "leila_swing" "sami_flow" "clara_steps" "kenji_beat" "iris_salsa" "leo_tango" "lina_groove" "adam_rock" "naima_latina" "robin_wave" "hana_kpop" "malik_pop" "zoe_vibes")

BIRTHDAYS=("1998-04-12" "1997-09-03" "2000-01-24" "1996-11-18" "1999-06-08" "1995-02-27" "2001-08-14" "1994-12-05" "2002-03-19" "1997-07-30" "1998-10-11" "1996-05-22" "2000-09-16" "1995-01-09" "1999-12-28")

KINDS=("woman" "man" "woman" "non_binary" "woman" "man" "non_binary" "man" "woman" "man" "woman" "non_binary" "woman" "man" "woman")

ORIENTATIONS=("all" "woman" "all" "all" "man" "all" "all" "woman" "all" "all" "man" "all" "all" "woman" "all")

BIOS=(
"Danseuse de salsa, toujours partante pour une soiree improvisee et un bon cafe apres les cours."
"Fan de hip-hop et de battles, je cherche quelqu'un avec qui partager des playlists et des fou-rires."
"J'adore le swing, les expos et les longues balades. Bonus si tu connais un bon spot de brunch."
"Je danse selon l'humeur : house, afro, contemporain. J'aime les gens curieux et spontanes."
"Team bachata et couchers de soleil. Je peux parler musique pendant des heures."
"Breakdance, cuisine japonaise et cinema. Je suis souvent le premier sur la piste."
"J'aime les danses latines, les voyages courts et les conversations qui commencent simplement."
"Tango debutant mais tres motive. Je cherche quelqu'un de patient et drole."
"Grande fan de groove et de funk. Toujours partante pour apprendre une nouvelle chore."
"Rock, lindy hop et humour douteux. Je promets au moins une danse sans marcher sur les pieds."
"Afro-latine, energie solaire, et passion pour les petits concerts."
"Je passe de la danse contemporaine au shuffle sans prevenir. J'aime les profils authentiques."
"K-pop, jazz funk et bubble tea. Je cherche quelqu'un avec une vraie bonne energie."
"Popping, locking et sorties entre amis. Plutot simple, plutot souriant."
"Danse, photo et playlists de nuit. J'aime quand les discussions sont naturelles."
)

PHOTOS=(
"/test-avatars/maya.jpg"
"/test-avatars/noah.jpg"
"/test-avatars/leila.jpg"
"/test-avatars/sami.jpg"
"/test-avatars/clara.jpg"
"/test-avatars/kenji.jpg"
"/test-avatars/iris.jpg"
"/test-avatars/leo.jpg"
"/test-avatars/lina.jpg"
"/test-avatars/adam.jpg"
"/test-avatars/naima.jpg"
"/test-avatars/robin.jpg"
"/test-avatars/hana.jpg"
"/test-avatars/malik.jpg"
"/test-avatars/zoe.jpg"
)

EMAILS=(
"maya@gmail.com"
"noah@gmail.com"
"leila@gmail.com"
"sami@gmail.com"
"clara@gmail.com"
"kenji@gmail.com"
"iris@gmail.com"
"leo@gmail.com"
"lina@gmail.com"
"adam@gmail.com"
"naima@gmail.com"
"robin@gmail.com"
"hana@gmail.com"
"malik@gmail.com"
"zoe@gmail.com"
)

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
        FAILED=1
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
    elif echo "$result" | grep -q 'déjà liké'; then
        echo "  user$from -> user$to : déjà liké (ignoré)"
    else
        echo "  user$from -> user$to : $result"
        FAILED=1
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
        FAILED=1
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
        FAILED=1
    fi
}

echo "== Creation des $COUNT comptes =="
for i in $(seq 1 $COUNT); do
    index=$((i - 1))
    email=${EMAILS[$index]}
    name=${NAMES[$index]}
    username=${USERNAMES[$index]}
    birthday=${BIRTHDAYS[$index]}
    kind=${KINDS[$index]}
    orientation=${ORIENTATIONS[$index]}
    biography=${BIOS[$index]}
    photo=${PHOTOS[$index]}

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
        FAILED=1
        continue
    fi
    TOKENS[$i]="$TOKEN"

    PROFILE=$(curl -k -s -X POST "$BASE_URL/users/createProfile" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d "{\"name\":\"$name\",\"username\":\"$username\",\"birthday\":\"$birthday\",\"kind\":\"$kind\",\"orientation\":\"$orientation\",\"biography\":\"$biography\",\"photo\":\"$photo\"}")

    echo "PROFILE RESPONSE for $email : $PROFILE"
    ME=$(curl -k -s -X GET "$BASE_URL/users/me" -H "Authorization: Bearer $TOKEN")
    IDS[$i]=$(echo "$ME" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

    if echo "$PROFILE" | grep -q '"statusCode"'; then
        echo "  $email : compte OK (id=${IDS[$i]}) mais profil refuse : $PROFILE"
        FAILED=1
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
echo "Comptes crees :"
for i in $(seq 0 $((COUNT - 1))); do
    echo "  ${EMAILS[$i]} / ${USERNAMES[$i]}"
done
echo "Mot de passe : $PASSWORD"
echo ""
echo "Matchs avec message      : user1-user2, user5-user6"
echo "Matchs 'Nouveau match !' : user3-user4, user7-user8, user9-user10,"
echo "                           user1-user3, user2-user4, user11-user12"
echo "Likes en attente         : user13 -> user1, user14 -> user1, user15 -> user2"
echo "                           (quand user1 ou user2 like en retour : MATCH)"
echo "======================================"
if [ "$FAILED" -ne 0 ]; then
    echo "ERREUR : au moins une création ou interaction a échoué." >&2
    exit 1
fi
