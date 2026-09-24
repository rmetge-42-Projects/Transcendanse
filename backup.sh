#!/bin/sh

while true; do
  # 1. Generate a timestamp for the filename
  TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
  BACKUP_FILE="/backups/backup_${TIMESTAMP}.sql"

  # 2. Export the database natively (PGPASSWORD is read automatically from the environment)
  pg_dump -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -f "$BACKUP_FILE"

  # 3. File Rotation: List backups by newest first, skip the top 6, and delete the rest
  ls -t /backups/backup_*.sql | tail -n +7 | xargs -r rm -f

  # 4. Enforce the 10-minute cadence (600 seconds)
  sleep 600
done