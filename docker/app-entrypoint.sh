#!/bin/sh
set -eu

mkdir -p storage/app/public storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

if [ ! -L public/storage ]; then
    php artisan storage:link --force
fi

# These caches are rebuilt on every container start so configuration always reflects
# the environment supplied by Docker rather than values baked into the image.
php artisan config:cache
php artisan route:cache
php artisan view:cache

if [ "$1" = "php-fpm" ]; then
    exec "$@"
fi

exec su-exec www-data "$@"
