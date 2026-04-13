<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureShopMember
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::check()) {
            return redirect()->route('login');
        }

        $shop = app('current_shop');
        $user = Auth::user();

        if (! $shop->hasMember($user)) {
            abort(403, 'You do not have access to this shop.');
        }

        return $next($request);
    }
}
