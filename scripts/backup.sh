#!/usr/bin/env bash
# Create a restorable backup before a Docker deployment.
# Run from any directory: bash /path/to/pos/scripts/backup.sh

set -Eeuo pipefail
umask 077

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_ROOT="${POS_BACKUP_ROOT:-$PROJECT_DIR/backups}"
STAMP="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
BACKUP_PATH="$BACKUP_ROOT/$STAMP"

fail() {
    printf '\nBackup failed at line %s. The source data was not modified.\n' "$1" >&2
}
trap 'fail "$LINENO"' ERR

cd "$PROJECT_DIR"

if ! command -v docker >/dev/null 2>&1 || ! docker compose version >/dev/null 2>&1; then
    echo "Docker Engine and the Docker Compose plugin are required." >&2
    exit 1
fi

if [[ ! -f .env ]]; then
    echo "Missing .env. Run this from the deployed POS project directory." >&2
    exit 1
fi

if [[ -z "$(docker compose ps --status running -q db)" ]] || [[ -z "$(docker compose ps --status running -q app)" ]]; then
    echo "The app and db services must both be running before creating a backup." >&2
    exit 1
fi

mkdir -p "$BACKUP_PATH"
cp .env "$BACKUP_PATH/environment.env"
chmod 600 "$BACKUP_PATH/environment.env"

printf 'Backing up MariaDB...\n'
docker compose exec -T db sh -c 'exec mariadb-dump --single-transaction --routines --events --add-drop-table -u"$MARIADB_USER" -p"$MARIADB_PASSWORD" "$MARIADB_DATABASE"' \
    > "$BACKUP_PATH/database.sql.part"
mv "$BACKUP_PATH/database.sql.part" "$BACKUP_PATH/database.sql"

printf 'Backing up persistent storage...\n'
docker compose exec -T app sh -c 'tar -C /var/www/html -czf - storage/app' \
    > "$BACKUP_PATH/storage.tar.gz.part"
mv "$BACKUP_PATH/storage.tar.gz.part" "$BACKUP_PATH/storage.tar.gz"
tar -tzf "$BACKUP_PATH/storage.tar.gz" >/dev/null

COMMIT="$(git rev-parse --short HEAD 2>/dev/null || printf 'unknown')"
{
    printf 'Created (UTC): %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    printf 'Git commit: %s\n' "$COMMIT"
    printf 'Environment: environment.env\n'
    printf 'Database: database.sql\n'
    printf 'Storage: storage.tar.gz\n'
} > "$BACKUP_PATH/manifest.txt"

if command -v sha256sum >/dev/null 2>&1; then
    (cd "$BACKUP_PATH" && sha256sum environment.env database.sql storage.tar.gz) > "$BACKUP_PATH/SHA256SUMS"
elif command -v shasum >/dev/null 2>&1; then
    (cd "$BACKUP_PATH" && shasum -a 256 environment.env database.sql storage.tar.gz) > "$BACKUP_PATH/SHA256SUMS"
fi

printf '\nBackup complete: %s\n' "$BACKUP_PATH"
printf 'Copy this directory to encrypted off-server storage before deploying.\n'
