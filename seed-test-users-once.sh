#!/bin/sh
set -eu

MARKER=/seed/completed
if [ -f "$MARKER" ]; then
    echo "Les utilisateurs de démonstration ont déjà été créés."
    exit 0
fi

echo "Création des utilisateurs de démonstration via ${BASE_URL}..."
bash /app/create-test-users.sh
touch "$MARKER"
echo "Initialisation des utilisateurs de démonstration terminée."
