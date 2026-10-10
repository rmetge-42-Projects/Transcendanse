#!/bin/bash
set -euo pipefail
umask 077

BACKUP_DIR="/backups"
TEMP_FILE=""
BACKUP_SECRET_DIR="${BACKUP_SECRET_DIR:-/run/backup-secrets}"
PGUSER="$(cat "$BACKUP_SECRET_DIR/db_user")"
PGPASSWORD="$(cat "$BACKUP_SECRET_DIR/db_password")"
PGDATABASE="$(cat "$BACKUP_SECRET_DIR/db_name")"
BACKUP_ENCRYPTION_KEY="$(cat "$BACKUP_SECRET_DIR/backup_encryption_key")"
export PGUSER PGPASSWORD PGDATABASE BACKUP_ENCRYPTION_KEY

cleanup() {
  if [ -n "$TEMP_FILE" ]; then
    rm -f "$TEMP_FILE"
  fi
}
trap cleanup EXIT
trap 'exit 1' HUP INT TERM

while :; do
  TIMESTAMP="$(date +"%Y-%m-%d_%H-%M-%S")"
  BACKUP_FILE="$BACKUP_DIR/backup_${TIMESTAMP}.sql.enc"
  TEMP_FILE="$BACKUP_FILE.tmp"

  echo "Starting database backup: $BACKUP_FILE"
  if ! timeout 300s bash -o pipefail -c 'pg_dump --no-password -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" | openssl enc -aes-256-cbc -salt -pbkdf2 -iter 600000 -pass env:BACKUP_ENCRYPTION_KEY' > "$TEMP_FILE"; then
    echo "ERROR: pg_dump failed; existing backups were preserved." >&2
    rm -f "$TEMP_FILE"
    TEMP_FILE=""
    exit 1
  fi

  if [ ! -s "$TEMP_FILE" ]; then
    echo "ERROR: pg_dump produced an empty file; existing backups were preserved." >&2
    rm -f "$TEMP_FILE"
    TEMP_FILE=""
    exit 1
  fi

  mv "$TEMP_FILE" "$BACKUP_FILE"
  TEMP_FILE=""
  echo "Backup completed successfully."

  ls -1t "$BACKUP_DIR"/backup_*.sql.enc | tail -n +7 | xargs -r rm -f --

  sleep 600
done
