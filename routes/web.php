<?php

use App\Http\Controllers\Admin\SalesController;
use App\Http\Controllers\Admin\Admin\ProductController;
use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\StockMovementController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\PosController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['admin'])->group(function () {
    //
    Route::get('/admin', [DashboardController::class, 'index'])->name('admin.dashboard');
    Route::get('/admin/analytics', [AnalyticsController::class, 'index'])->name('admin.analytics');
    Route::get('/admin/inventory/movements', [StockMovementController::class, 'index'])->name('admin.inventory.movements');
    Route::get('/admin/products/inventory', [ProductController::class, 'Inventory'])->name('admin.products.inventory');
    
    
    Route::get('/admin/products/create', [ProductController::class, 'AddProductPage'])->name('admin.products.create');
    
    Route::post('/admin/products/create', [ProductController::class, 'StoreProduct'])->name('admin.products.create.post');


    Route::get('/admin/products/edit/{id}', [ProductController::class, 'EditProductPage'])->name('admin.products.edit');
    Route::put('/admin/products/edit/{id}', [ProductController::class, 'UpdateProduct'])->name('admin.products.edit.post');

    Route::post('/admin/products/add-stock/{variant_id}', [ProductController::class, 'AddStock'])->name('admin.products.add-stock');

    Route::delete('/admin/products/stocks/delete/{id}', [ProductController::class, 'DeleteProductStock'])->name('admin.products.stocks.delete');

    Route::get('/admin/pos',[PosController::class,'index'])->name('admin.pos.index');
    Route::post('/admin/pos/checkout', [PosController::class, 'checkout'])->name('admin.pos.checkout');

    Route::get('/admin/sales', [SalesController::class, 'index'])->name('admin.sales.index');
    Route::get('/admin/sales/{id}', [SalesController::class, 'show'])->name('admin.sales.show');
});






Route::get('/', [CustomerController::class, 'index'])->name('admin.customers.index');

Route::middleware(['customer'])->group(function () {
    Route::post('/cart/add/{variant_id}', [CustomerController::class, 'addToCart'])->name('customer.cart.add');
    Route::delete('/cart/remove/{cart_id}', [CustomerController::class, 'removeFromCart'])->name('customer.cart.remove');

    Route::get('/checkout', [CustomerController::class, 'checkout'])->name('customer.checkout');

    Route::put('/cart/quantity/update/{cart_id}', [CustomerController::class, 'updateCartQuantity'])->name('customer.cart.update_quantity');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';


