<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withBroadcasting(__DIR__.'/../routes/channels.php')
    ->withMiddleware(function (Middleware $middleware): void {
        // PHP-FPM is only reachable through the Docker Caddy proxy. Trust its
        // forwarded scheme so signed URLs generated as HTTPS also validate as
        // HTTPS when the request reaches Laravel.
        $middleware->trustProxies(at: '*');

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'admin'       => \App\Http\Middleware\AdminMiddleware::class,
            'Guest'       => \App\Http\Middleware\GuestMiddleware::class,
            'shop'        => \App\Http\Middleware\ResolveShop::class,
            'shop.member' => \App\Http\Middleware\EnsureShopMember::class,
            'shop.role'   => \App\Http\Middleware\RequireShopRole::class,
        ]);
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
