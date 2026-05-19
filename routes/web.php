<?php

use App\Http\Controllers\Admin\Admin\ProductController;
use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\PosController;
use App\Http\Controllers\Admin\SalesController;
use App\Http\Controllers\Admin\StockMovementController;
use App\Http\Controllers\Admin\TeamController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ShopSelectorController;
use Illuminate\Support\Facades\Route;

// Public marketing / SEO landing page.
Route::view('/', 'welcome')->name('home');

// Shop selection for users belonging to multiple shops.
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/select-shop', [ShopSelectorController::class, 'index'])->name('shop.select');
    Route::post('/select-shop', [ShopSelectorController::class, 'store'])->name('shop.select.store');

    Route::view('/onboarding', 'onboarding')->name('onboarding');

    Route::get('/dashboard', function () {
        $user = request()->user();
        $shops = $user?->shops;

        if ($shops?->count() === 1) {
            $shop = $shops->first();
            $route = $shop->roleOf($user) === 'cashier' ? 'admin.pos.index' : 'admin.dashboard';
            return redirect()->route($route, ['shop' => $shop->slug]);
        }

        if ($shops?->count() > 1) {
            return redirect()->route('shop.select');
        }

        return redirect()->route('onboarding');
    })->name('dashboard');
});

// Profile.
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

// Per-shop admin routes. Keep this catch-all group after fixed routes like /login and /profile.
Route::prefix('{shop:slug}')
    ->middleware(['verified', 'shop', 'shop.member'])
    ->group(function () {
        // Full access: owner + manager
        Route::middleware(['shop.role:owner,manager'])->group(function () {
            Route::get('/', [DashboardController::class, 'index'])->name('admin.dashboard');
            Route::get('/analytics', [AnalyticsController::class, 'index'])->name('admin.analytics');

            Route::get('/inventory/movements', [StockMovementController::class, 'index'])->name('admin.inventory.movements');
            Route::get('/products/inventory', [ProductController::class, 'Inventory'])->name('admin.products.inventory');

            Route::get('/products/create', [ProductController::class, 'AddProductPage'])->name('admin.products.create');
            Route::post('/products/create', [ProductController::class, 'StoreProduct'])->name('admin.products.create.post');
            Route::get('/products/edit/{id}', [ProductController::class, 'EditProductPage'])->name('admin.products.edit');
            Route::put('/products/edit/{id}', [ProductController::class, 'UpdateProduct'])->name('admin.products.edit.post');
            Route::post('/products/add-stock/{variant_id}', [ProductController::class, 'AddStock'])->name('admin.products.add-stock');
            Route::delete('/products/stocks/delete/{id}', [ProductController::class, 'DeleteProductStock'])->name('admin.products.stocks.delete');

            Route::get('/sales', [SalesController::class, 'index'])->name('admin.sales.index');
            Route::get('/sales/{id}', [SalesController::class, 'show'])->name('admin.sales.show');
        });

        // POS: all shop members (owner, manager, cashier)
        Route::get('/pos', [PosController::class, 'index'])->name('admin.pos.index');
        Route::post('/pos/checkout', [PosController::class, 'checkout'])->name('admin.pos.checkout');

        // Team management: owner only
        Route::middleware(['shop.role:owner'])->group(function () {
            Route::get('/settings/team', [TeamController::class, 'index'])->name('admin.settings.team');
            Route::post('/settings/team', [TeamController::class, 'invite'])->name('admin.settings.team.invite');
            Route::put('/settings/team/{userId}', [TeamController::class, 'updateRole'])->name('admin.settings.team.update');
            Route::delete('/settings/team/{userId}', [TeamController::class, 'remove'])->name('admin.settings.team.remove');
        });
    });
