<?php

if (PHP_SAPI !== 'cli-server' || getenv('APP_ENV') !== 'testing' || ! getenv('PLATFORM_E2E_DIR')) {
    http_response_code(404);
    exit;
}

$public = realpath(__DIR__.'/../../public');
$path = realpath($public.parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
if ($path && str_starts_with($path, $public.DIRECTORY_SEPARATOR) && is_file($path)) {
    return false;
}

require __DIR__.'/../../vendor/autoload.php';
$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Http\Kernel::class)->bootstrap();
// Exercise production assets without touching an existing developer's public/hot.
$app->make(Illuminate\Foundation\Vite::class)->useHotFile(getenv('PLATFORM_E2E_DIR').'/disabled.hot');
$app->handleRequest(Illuminate\Http\Request::capture());
