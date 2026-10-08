#!/bin/bash
# Reproduit le crash de handleDisconnect : un token VALIDE dont l'utilisateur
# n'existe plus en base. Sans la correction, le backend meurt (502).
# Usage (depuis la racine du projet, stack demarree) : bash test-handledisconnect.sh

BASE_URL="https://localhost:8443/api"
EMAIL="crash-test@test.com"
PASSWORD="motdepasse123"

DB_USER=$(grep '^DB_USER=' .env 2>/dev/null | cut -d= -f2)
DB_NAME=$(grep '^DB_NAME=' .env 2>/dev/null | cut -d= -f2)
DB_USER=${DB_USER:-cindy}
DB_NAME=${DB_NAME:-transcendance}

get_token() {
    echo "$1" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4
}

echo "1. Creation d'un compte temporaire ($EMAIL)"
RES=$(curl -k -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"validatePassword\":\"$PASSWORD\"}")
TOKEN=$(get_token "$RES")
if [ -z "$TOKEN" ]; then
    RES=$(curl -k -s -X POST "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
    TOKEN=$(get_token "$RES")
fi
if [ -z "$TOKEN" ]; then
    echo "   Impossible d'obtenir un token. Le backend repond-il ? Reponse : $RES"
    exit 1
fi
echo "   token obtenu"

echo "2. Suppression de ce compte en base (le token reste valide, l'utilisateur disparait)"
docker compose exec -T database psql -U "$DB_USER" -d "$DB_NAME" \
    -c "DELETE FROM \"User\" WHERE email='$EMAIL';"

echo "3. Connexion socket avec ce token, directement sur le backend"
docker compose exec -T -e T="$TOKEN" frontend node - << 'JS'
const { io } = require('socket.io-client');
const s = io('http://backend:3000', { auth: { token: process.env.T }, transports: ['websocket'] });
s.on('connect', () => console.log('   socket : connecte'));
s.on('disconnect', (r) => { console.log('   socket : deconnecte (' + r + ')'); setTimeout(() => process.exit(0), 500); });
s.on('connect_error', (e) => { console.log('   socket : erreur de connexion : ' + e.message); process.exit(0); });
setTimeout(() => { console.log('   socket : pas de reponse en 8 s'); process.exit(0); }, 8000);
JS

echo "4. Le backend est-il encore vivant ?"
sleep 4
CODE=$(curl -k -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" -d '{}')
echo "   code HTTP : $CODE"

echo ""
case "$CODE" in
    400) echo "RESULTAT : OK, le backend a survecu (la correction est active)." ;;
    502|503|000) echo "RESULTAT : le backend est MORT (la correction est absente ou inactive)." ;;
    *) echo "RESULTAT : reponse inattendue ($CODE), regarde les logs ci-dessous." ;;
esac

echo ""
echo "Lignes utiles des logs du backend :"
docker compose logs backend --tail 60 2>&1 | grep -E "P2025|introuvable|handleDisconnect|successfully started" | tail -6