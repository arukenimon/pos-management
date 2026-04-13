<?php

namespace App\Http\Middleware;

use App\Models\Shop;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveShop
{
    public function handle(Request $request, Closure $next): Response
    {
        $slug = $request->route('shop');

        if (! $slug) {
            abort(404);
        }

        $shop = Shop::where('slug', is_string($slug) ? $slug : $slug->slug)->firstOrFail();

        // Bind the current shop into the service container so models/controllers can access it
        app()->instance('current_shop', $shop);

        // Also make it available on the request for convenience
        $request->attributes->set('current_shop', $shop);

        return $next($request);
    }
}
