<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
    {
        $products = Product::with([
            'variants.inventories',
            'variants.attributeValues.attribute',
            'variants.cartItems' => function ($query) {
                $query->where('customer_id', Auth::id());
            },
        ])->whereHas('variants.inventories', fn($q) => $q->where('quantity', '>', 0))
          ->get();

        return Inertia::render('Customer/Index', [
            'products' => $products,
        ]);
    }

    public function addToCart(Request $request, $variant_id)
    {
        $variant = ProductVariant::findOrFail($variant_id);

        Cart::create([
            'customer_id'        => Auth::id(),
            'product_variant_id' => $variant->id,
            'quantity'           => 1,
        ]);

        return back()->with('success', 'Added to cart!');
    }

    public function checkout()
    {
        $cartItems = Cart::with([
            'variant.product',
            'variant.inventories' => fn($q) => $q->orderBy('created_at', 'asc')->limit(1),
            'variant.attributeValues.attribute',
        ])->where('customer_id', Auth::id())
          ->orderBy('created_at', 'desc')
          ->get();

        return Inertia::render('Customer/Checkout', [
            'carts' => $cartItems,
        ]);
    }

    public function removeFromCart(Request $request, $cart_id)
    {
        $cartItem = Cart::where('id', $cart_id)
            ->where('customer_id', Auth::id())
            ->first();

        if ($cartItem) {
            $cartItem->delete();
        }

        return back()->with('success', 'Product removed from cart successfully!');
    }

    public function updateCartQuantity(Request $request, $cart_id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cartItem = Cart::where('id', $cart_id)
            ->where('customer_id', Auth::id())
            ->first();

        if ($cartItem) {
            $cartItem->quantity = $request->input('quantity');
            $cartItem->save();
        }

        return back();
    }
}
