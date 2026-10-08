#!/bin/bash
# Verifie que chaque paquet importe dans le code est declare dans package.json.
# Le package.json lu est celui de la BRANCHE (pas celui de ton disque, que
# "make build" modifie), et c'est celui que tes camarades recoivent avec git pull.
#
# Usage (depuis la racine du projet) :
#   git fetch origin && bash check-deps.sh            # compare avec origin/dev
#   bash check-deps.sh origin/cindy                    # ou une autre branche

REF=${1:-origin/dev}
BUILTINS="path|fs|crypto|http|https|os|util|url|stream|events|buffer|child_process|zlib|net|tls|dns|assert|querystring|readline"
problems=0

for dir in backend front; do
    PKG=$(git show "$REF:$dir/package.json" 2>/dev/null)
    if [ -z "$PKG" ]; then
        echo "Impossible de lire $dir/package.json sur $REF (git fetch origin ?)"
        continue
    fi

    echo "== $dir (package.json de $REF)"
    deps=$(grep -rhoE "from ['\"][^./'\"][^'\"]*['\"]" "$dir/src" --include="*.ts" --include="*.tsx" \
        | sed -E "s/from ['\"]//; s/['\"]$//" \
        | grep -v '^@/' \
        | grep -v '^node:' \
        | sed -E 's#^(@[^/]+/[^/]+).*#\1#; s#^([^@/][^/]*).*#\1#' \
        | grep -vE "^($BUILTINS)$" \
        | sort -u)

    for dep in $deps; do
        if echo "$PKG" | grep -q "\"$dep\""; then
            continue
        fi
        dep_re=$(echo "$dep" | sed 's/\./\\./g')
        if grep -qE "[[:space:]]${dep_re}(@[^[:space:]]*)?([[:space:]\\\\]|\$)" Makefile 2>/dev/null; then
            echo "  absent du package.json, mais dans le Makefile (make build l'installe) : $dep"
        else
            echo "  MANQUANT (ni package.json, ni Makefile) : $dep"
        fi
        problems=1
    done
done

echo ""
if [ $problems -eq 0 ]; then
    echo "Tous les paquets importes sont declares."
fi
