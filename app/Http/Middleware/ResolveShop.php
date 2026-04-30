<?php

namespace App\Http\Middleware;

use App\Models\Shop;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\Response;

class ResolveShop
{
    public function handle(Request $request, Closure $next): Response
    {
        $slug = $request->route('shop');

        if (! $slug) {
            abort(404);
        }

        $slugStr = is_string($slug) ? $slug : $slug->slug;
        $shop = Shop::where('slug', $slugStr)->firstOrFail();

        app()->instance('current_shop', $shop);
        URL::defaults(['shop' => $shop->slug]);
        $request->attributes->set('current_shop', $shop);

        return $next($request);
    }
}
