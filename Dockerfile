# syntax=docker/dockerfile:1

# Build the versioned front-end assets once, outside the runtime image.
FROM node:22-alpine AS frontend
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY resources ./resources
COPY public ./public
COPY vite.config.js tsconfig.json tailwind.config.js postcss.config.js ./
RUN npm run build

# Install PHP packages separately so production images contain no Composer or dev tools.
FROM composer:2 AS vendor
WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-scripts \
    --prefer-dist \
    --no-interaction \
    --no-progress \
    --optimize-autoloader

FROM php:8.3-fpm-alpine AS production
WORKDIR /var/www/html

RUN apk add --no-cache \
        icu-libs \
        libjpeg-turbo \
        libpng \
        libzip \
        oniguruma \
        su-exec \
    && apk add --no-cache --virtual .build-deps \
        $PHPIZE_DEPS \
        icu-dev \
        libjpeg-turbo-dev \
        libpng-dev \
        libzip-dev \
        oniguruma-dev \
    && docker-php-ext-configure gd --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" bcmath exif gd intl mbstring opcache pcntl pdo_mysql zip \
    && apk del .build-deps

COPY --from=vendor /app/vendor ./vendor
COPY . .
COPY --from=frontend /app/public/build ./public/build
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini
COPY docker/app-entrypoint.sh /usr/local/bin/app-entrypoint

RUN chmod +x /usr/local/bin/app-entrypoint \
    && php artisan package:discover --ansi \
    && ln -s ../storage/app/public public/storage \
    && chown -R www-data:www-data bootstrap/cache storage

ENTRYPOINT ["app-entrypoint"]
CMD ["php-fpm"]

# Caddy terminates TLS and serves static files while forwarding PHP requests to FPM.
FROM caddy:2-alpine AS web
COPY docker/caddy/Caddyfile /etc/caddy/Caddyfile
COPY --from=production /var/www/html/public /var/www/html/public
COPY --from=production /var/www/html/storage/app/public /var/www/html/storage/app/public
RUN rm -rf /var/www/html/public/storage \
    && ln -s ../storage/app/public /var/www/html/public/storage
