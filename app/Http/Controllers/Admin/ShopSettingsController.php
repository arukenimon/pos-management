<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShopSettingsController extends Controller
{
    public function index()
    {
        $shop = app('current_shop');

        return Inertia::render('Auth/Admin/Settings/Index', [
            'shop' => [
                'name' => $shop->name,
                'slug' => $shop->slug,
                'description' => $shop->description,
                'currency' => $shop->currency ?? 'PHP',
                'taxRate' => (string) ($shop->tax_rate ?? '0.00'),
                'receiptFooter' => $shop->receipt_footer,
                'paymentMethods' => $shop->payment_methods ?: ['cash', 'card', 'e_wallet'],
                'barcodeScanningEnabled' => $shop->barcode_scanning_enabled ?? true,
                'lowStockThreshold' => $shop->low_stock_threshold ?? 5,
            ],
        ]);
    }

    public function update(Request $request)
    {
        $attributes = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:500'],
            'currency' => ['required', 'string', 'size:3', 'alpha'],
            'taxRate' => ['required', 'numeric', 'between:0,100'],
            'receiptFooter' => ['nullable', 'string', 'max:255'],
            'paymentMethods' => ['required', 'array', 'min:1'],
            'paymentMethods.*' => ['in:cash,card,e_wallet'],
            'barcodeScanningEnabled' => ['required', 'boolean'],
            'lowStockThreshold' => ['required', 'integer', 'min:0', 'max:10000'],
        ]);

        $shop = app('current_shop');
        $shop->update([
            'name' => $attributes['name'],
            'description' => $attributes['description'],
            'currency' => strtoupper($attributes['currency']),
            'tax_rate' => $attributes['taxRate'],
            'receipt_footer' => $attributes['receiptFooter'],
            'payment_methods' => $attributes['paymentMethods'],
            'barcode_scanning_enabled' => $attributes['barcodeScanningEnabled'],
            'low_stock_threshold' => $attributes['lowStockThreshold'],
        ]);

        return back()->with('success', 'Admin settings saved.');
    }
}
