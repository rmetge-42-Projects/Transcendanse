# Restauration et limites de reprise — Chi-Fou-Mi

Ce document décrit la restauration **de la base PostgreSQL seulement** après suppression ou perte de son volume. Il ne constitue pas une reprise complète de la plateforme.

## Ce que les sauvegardes couvrent

- `backup_monitor` crée un dump PostgreSQL chiffré environ toutes les dix minutes dans `backups/`.
- Le répertoire `backups/` est un bind mount sur l’hôte, ignoré par Git ; il n’est pas supprimé par `docker compose down -v` ni par `make fclean`.
- Le service conserve les six fichiers les plus récents, soit environ une heure de rétention en fonctionnement nominal.
- Le dump ne comprend pas les uploads du volume `vol_back`, le stockage Vault, les données internes de Grafana, l’historique Prometheus ni l’état/silences Alertmanager.

**Avant toute suppression de volumes**, copie les dumps importants hors de cette machine. `make fclean` et `make re` suppriment les volumes Compose du projet, notamment la base, Vault, les uploads, Grafana et les métriques Prometheus. Les fichiers dans `backups/` restent sur le disque local, mais ne protègent pas contre la perte de ce disque.

## Prérequis

1. Être dans la racine du projet Chi-Fou-Mi.
2. Avoir un `.env` valide, non commité, avec `DB_USER`, `DB_PASSWORD`, `DB_NAME` et la même `BACKUP_ENCRYPTION_KEY` que celle utilisée lors du chiffrement du dump.
3. Pour rétablir l’envoi Gmail après une recréation de Vault, configurer aussi `GMAIL_APP_PASSWORD` dans `.env`. Ne jamais coller ces valeurs dans un ticket, un chat ou le rapport d’audit.
4. Avoir au moins un fichier `backups/backup_*.sql.enc` non vide.

Sans la clé de chiffrement d’origine, le dump ne peut pas être restauré. Ne remplace pas cette clé par une nouvelle valeur avant le déchiffrement.

## Restaurer PostgreSQL dans un volume neuf

Cette procédure est destinée à un volume PostgreSQL neuf, par exemple après `make fclean`. **Ne l’exécute pas sur une base existante contenant des données à conserver** : elle peut échouer sur des objets déjà présents ou produire une restauration partielle.

Le script choisit le dump le plus récent, extrait la clé localement sans l’afficher, déchiffre vers un fichier temporaire privé, puis importe le SQL avant de démarrer le reste du stack.

```sh
set -eu
set +x

if [ ! -r .env ]; then
  echo "Erreur : .env est absent ou illisible." >&2
  exit 1
fi

BACKUP_FILE="$(ls -1t backups/backup_*.sql.enc 2>/dev/null | head -n 1)"
if [ -z "$BACKUP_FILE" ] || [ ! -s "$BACKUP_FILE" ]; then
  echo "Erreur : aucun dump chiffré non vide trouvé dans backups/." >&2
  exit 1
fi

BACKUP_ENCRYPTION_KEY="$(sed -n 's/^BACKUP_ENCRYPTION_KEY=//p' .env | tail -n 1)"
if [ -z "$BACKUP_ENCRYPTION_KEY" ]; then
  echo "Erreur : BACKUP_ENCRYPTION_KEY est absente de .env." >&2
  exit 1
fi
export BACKUP_ENCRYPTION_KEY

umask 077
RESTORE_FILE="$(mktemp "${TMPDIR:-/tmp}/chi-fou-mi-restore.XXXXXX")"
cleanup() {
  rm -f "$RESTORE_FILE"
  unset BACKUP_ENCRYPTION_KEY
}
trap cleanup EXIT
trap 'exit 1' HUP INT TERM

openssl enc -d -aes-256-cbc -pbkdf2 -iter 600000 \
  -pass env:BACKUP_ENCRYPTION_KEY \
  -in "$BACKUP_FILE" -out "$RESTORE_FILE"

if [ ! -s "$RESTORE_FILE" ] || ! head -n 5 "$RESTORE_FILE" | grep -q '^-- PostgreSQL database dump'; then
  echo "Erreur : le fichier déchiffré ne ressemble pas à un dump PostgreSQL." >&2
  exit 1
fi

docker compose up -d database
ready=0
for attempt in $(seq 1 30); do
  if docker compose exec -T database sh -c \
    'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"' >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 2
done
if [ "$ready" -ne 1 ]; then
  echo "Erreur : PostgreSQL n’est pas prêt ; import annulé." >&2
  exit 1
fi

docker compose exec -T database sh -c \
  'PGPASSWORD="$POSTGRES_PASSWORD" psql --no-password -h 127.0.0.1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1' \
  < "$RESTORE_FILE"

rm -f "$RESTORE_FILE"
trap - EXIT HUP INT TERM
unset BACKUP_ENCRYPTION_KEY

docker compose up --build -d
```

Après l’import, vérifie `docker compose ps` et l’endpoint de santé dans l’application. Si `psql` échoue, considère la restauration comme **incomplète** : l’import peut avoir appliqué une partie des commandes SQL. Conserve le dump chiffré original et ne présente pas le service comme restauré avant d’avoir contrôlé la base et l’application.

## Limite de détection d’altération

Le format actuel utilise `openssl enc -aes-256-cbc -pbkdf2`. AES-CBC chiffre le contenu, mais n’authentifie pas le fichier. Un fichier tronqué ou modifié peut échouer au déchiffrement, mais l’absence d’erreur ne prouve pas que son contenu n’a pas été altéré. La vérification de l’en-tête PostgreSQL ci-dessus est un contrôle de format sommaire, pas une preuve d’intégrité. Prévois une migration vers un format de chiffrement authentifié et une procédure de vérification associée.

## Conséquences d’une recréation complète de Vault

Après `make fclean`, le volume Vault et son volume de clés sont supprimés. Au redémarrage, l’initialisation recrée Vault et les secrets runtime depuis `.env`; elle génère aussi un nouveau secret JWT si aucun secret n’existe encore. Cela peut invalider les sessions précédentes. L’historique des versions de secrets et les anciens tokens Vault ne sont pas restaurés par le dump PostgreSQL.

Le bootstrap actuel conserve les parts d’unseal et le root token ensemble dans le volume `vol_vault_keys`. C’est un risque connu : cette procédure de développement n’offre pas une séparation effective des dépositaires Shamir. Les identifiants Grafana sont également régénérés lorsque son volume et le volume Vault sont neufs. Pour récupérer le mot de passe Grafana généré, utilise une session locale et privée, sans enregistrer la sortie dans un fichier partagé :

```sh
docker compose exec -it vault sh
```

Dans le shell du conteneur, après que Vault est prêt :

```sh
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/vault/tls/vault.crt
export VAULT_TOKEN="$(awk '/Initial Root Token:/ {print $4}' /vault/keys/keys.txt)"
vault kv get -field=admin_password secret/runtime/grafana
unset VAULT_TOKEN
```

La commande affiche un secret à l’écran : garde cette session privée et ne copie pas le résultat dans le dépôt. L’accès au root token de cette manière est une conséquence de l’architecture actuelle, à durcir avant tout usage réel.

## Reprise complète à mettre en place

Pour pouvoir reprendre l’application après la perte d’un poste ou d’un disque, il reste à organiser une copie chiffrée hors machine, sauvegarder les uploads si nécessaire, protéger séparément les clés Vault et tester périodiquement une restauration complète sur un environnement propre. Définis aussi les objectifs de perte de données acceptable (RPO) et de délai de reprise (RTO).
