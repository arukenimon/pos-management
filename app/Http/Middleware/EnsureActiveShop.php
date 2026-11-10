<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveShop
{
    public function handle(Request $request, Closure $next): Response
    {
        if (app('current_shop')->suspended_at) {
            if ($request->expectsJson() && ! $request->header('X-Inertia')) {
                abort(403, 'This shop is suspended.');
            }

            return Inertia::render('ShopSuspended', [
                'shopName' => app('current_shop')->name,
            ])->toResponse($request)->setStatusCode(403);
        }

        return $next($request);
    }
}
