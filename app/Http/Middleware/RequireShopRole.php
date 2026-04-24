<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RequireShopRole
{
    /**
     * Usage in route definition:
     *   ->middleware('shop.role:owner,manager')
     *
     * Roles are hierarchical: owner > manager > cashier
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $shop = app('current_shop');
        $user = Auth::user();

        $userRole = $shop->roleOf($user);

        if ($userRole === null || ! in_array($userRole, $roles, true)) {
            abort(403, 'You do not have the required role for this action.');
        }

        return $next($request);
    }
}
