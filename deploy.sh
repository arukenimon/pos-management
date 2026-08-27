#!/usr/bin/env bash
# Deploy the latest master branch to this VPS.
# Run from any directory: bash /path/to/pos/deploy.sh

set -Eeuo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRANCH="${DEPLOY_BRANCH:-master}"
CREATE_BACKUP=false
BACKUP_ONLY=false

usage() {
    cat <<'EOF'
Usage: bash deploy.sh [--backup | --backup-only]

  --backup       Create a backup, then deploy.
  --backup-only  Create a backup without deploying.
EOF
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --backup)
            CREATE_BACKUP=true
            ;;
        --backup-only)
            CREATE_BACKUP=true
            BACKUP_ONLY=true
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1" >&2
            usage >&2
            exit 1
            ;;
    esac
    shift
done

log() {
    printf '\n==> %s\n' "$*"
}

fail() {
    printf '\nDeployment failed at line %s. Existing containers were left unchanged where possible.\n' "$1" >&2
}
trap 'fail "$LINENO"' ERR

cd "$PROJECT_DIR"

if ! command -v docker >/dev/null 2>&1 || ! docker compose version >/dev/null 2>&1; then
    echo "Docker Engine and the Docker Compose plugin are required." >&2
    exit 1
fi

if [[ ! -f .env ]]; then
    echo "Missing .env. Create it from .env.docker.example before deploying." >&2
    exit 1
fi

if [[ "$CREATE_BACKUP" == true ]]; then
    log "Creating backup"
    bash scripts/backup.sh
fi

if [[ "$BACKUP_ONLY" == true ]]; then
    log "Backup complete; deployment was not requested"
    exit 0
fi

# Protect the VPS configuration from an accidental checkout/pull over local edits.
if [[ -n "$(git status --porcelain)" ]]; then
    echo "Refusing to deploy with uncommitted Git changes. Commit, stash, or remove them first." >&2
    exit 1
fi

log "Fetching origin/$BRANCH"
git fetch --prune origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

log "Validating Docker Compose configuration"
docker compose config --quiet

log "Building images from the latest code"
docker compose build --pull app web

log "Starting and waiting for MariaDB"
docker compose up -d --wait db

log "Running database migrations"
docker compose run --rm --no-deps app php artisan migrate --force

log "Recreating application services"
docker compose up -d --remove-orphans

log "Deployment complete"
docker compose ps
printf '\nNow running commit: %s\n' "$(git rev-parse --short HEAD)"
