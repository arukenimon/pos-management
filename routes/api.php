<?php

use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');



Route::middleware(['web', 'auth','admin'])->group(function () {
    Route::get('/admin/products/stocks/{productId}', function (Request $request, $productId) {
        $stocks = Inventory::whereHas('variant', fn ($query) => $query->where('product_id', $productId))
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($stocks);
    });
});
