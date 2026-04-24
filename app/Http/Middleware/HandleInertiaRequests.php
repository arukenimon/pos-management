<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // ResolveShop (route middleware) runs after this (web group) middleware,
        // so app('current_shop') is not yet bound here. Resolve directly instead.
        $currentShop = null;
        $slug = $request->route('shop');
        if ($slug) {
            $slugStr = is_string($slug) ? $slug : (is_object($slug) ? $slug->slug : null);
            if ($slugStr) {
                $currentShop = \App\Models\Shop::where('slug', $slugStr)->first();
            }
        }

        $shopRole = null;
        if ($currentShop && $request->user()) {
            $shopRole = $currentShop->roleOf($request->user());
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user'      => $request->user(),
                'shopRole'  => $shopRole,
            ],
            'currentShop' => $currentShop ? [
                'id'   => $currentShop->id,
                'name' => $currentShop->name,
                'slug' => $currentShop->slug,
            ] : null,
            'flash' => [
                'success' => session('success'),
                'error'   => session('error'),
            ],
        ];
    }
}
