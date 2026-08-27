# Deployment and backup runbook

This is the production runbook for the Docker Compose deployment. It protects the two persistent parts of the POS: the MariaDB database (sales, products, users, stock movements, and settings) and Laravel storage (uploaded product images and application files). A database dump by itself is not a complete POS backup.

## Before every deployment

Run this command on the VPS from the deployed project directory to create a
backup before fetching code, building images, or running migrations. Deployment
stops if that requested backup fails.

```bash
bash deploy.sh --backup
```

To deploy without creating a backup, run `bash deploy.sh`. To create only a
backup without deploying, run `bash deploy.sh --backup-only`.

`backup.sh` requires the `app` and `db` services to be running. It creates a private, timestamped directory under `backups/` containing:

- `database.sql` - a consistent MariaDB dump, including routines and events.
- `storage.tar.gz` - durable Laravel application files, including uploaded product images. Logs and generated caches are intentionally excluded.
- `environment.env` - the production environment settings, including `APP_KEY`.
- `manifest.txt` - creation time and the Git commit that was running.
- `SHA256SUMS` - integrity checksums when `sha256sum` or `shasum` is installed.

The script only reads the live services; it does not stop containers or change production data. Backups contain customer, user, sales, and deployment secrets. The destination is created with owner-only permissions, but it must still be copied to encrypted, access-controlled storage outside the VPS. Never commit it or send it over ordinary chat or email. Keep at least one verified recent backup off the server.

To create an additional manual backup, or to keep backups on a separate mounted
disk instead of the repository, choose a destination explicitly:

```bash
POS_BACKUP_ROOT=/srv/pos-backups bash scripts/backup.sh
```

Do not run `docker compose down -v` during normal deployment or maintenance. The `-v` flag removes the database and storage volumes.

## Restore procedure

Restoring replaces live data. Perform it only after choosing the exact backup directory, and take a fresh backup of the current state first if it is still accessible.

1. Put the site into maintenance mode and stop workers from processing new jobs:

   ```bash
   docker compose exec app php artisan down
   docker compose stop queue scheduler
   ```

2. Verify the selected backup before touching production:

   ```bash
   cd backups/2026-01-01T00-00-00Z
   cat manifest.txt
   sha256sum -c SHA256SUMS
   tar -tzf storage.tar.gz >/dev/null
   ```

   For a complete new-server recovery, place `environment.env` in the project
   root as `.env` before starting the services. Do not replace an existing
   production `.env` unless this is the intended recovery point.

3. Restore the database. The SQL dump includes table-drop statements, so this replaces the current database contents:

   ```bash
   docker compose exec -T db sh -c 'exec mariadb -u"$MARIADB_USER" -p"$MARIADB_PASSWORD" "$MARIADB_DATABASE"' < database.sql
   ```

4. Restore uploaded files. The following removes the current application files before extracting the archived `storage/app` directory, so re-check the backup path before running it:

   ```bash
   docker compose exec -T app sh -c 'rm -rf storage/app/* storage/app/.[!.]* 2>/dev/null || true; tar -xzf - -C /var/www/html' < storage.tar.gz
   ```

5. Bring the services back and confirm the application can read its data:

   ```bash
   docker compose up -d app queue scheduler web
   docker compose exec app php artisan migrate --force
   docker compose exec app php artisan up
   docker compose ps
   ```

Log in, open a recent sale, check its receipt and product image, and compare the dashboard figures with the selected backup before declaring the restore complete.

## Monthly recovery check

At least monthly, restore the newest backup into a separate test VPS or isolated Docker project. Confirm that login, product images, inventory quantities, a recent sale, and a receipt are all present. A backup is only dependable once it has been restored successfully.
