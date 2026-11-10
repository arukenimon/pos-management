<?php

use App\Models\Inventory;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware(['auth:sanctum', 'account.active']);



Route::middleware(['web', 'auth', 'verified', 'account.active', 'admin'])->group(function () {
    Route::get('/admin/products/stocks/{productId}', function (Request $request, $productId) {
        $product = Product::withoutGlobalScope('shop')->with('shop')->findOrFail($productId);
        abort_unless($product->shop && in_array($product->shop->roleOf($request->user()), ['owner', 'manager'], true), 403);
        abort_if($product->shop->suspended_at, 403, 'This shop is suspended.');
        app()->instance('current_shop', $product->shop);
        $stocks = Inventory::whereHas('variant', fn ($query) => $query->where('product_id', $productId))
            ->where('shop_id', $product->shop_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($stocks);
    });
});
