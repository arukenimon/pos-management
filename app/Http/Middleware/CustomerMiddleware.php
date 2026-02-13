<?php

namespace App\Http\Middleware;

use App\Http\Controllers\RootRedirectController;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CustomerMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {

        if(Auth::check()){
            $user = Auth::user();
        }else{
            return redirect()->route('login');
        }

        if ($user->role !== 'guest') {
            return app(RootRedirectController::class)->getRedirectRoute();
        }

        return $next($request);
    }
}
