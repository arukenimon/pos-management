<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CustomerController extends Controller
{
    //


    public function index(){

        $products = Product::with(['stocks','cartItems' => function($query) {
            $query->where('customer_id', Auth::id());
        }])->whereHas('stocks')->get();

        return Inertia::render('Customer/Index',[
            'products' => $products,
        ]);
    }

    public function addToCart(Request $request, $product_id){
        // Logic to add product to cart for the customer
        
        Cart::create([
            'customer_id' => Auth::id(),
            'product_id' => $product_id,
            'quantity' => 1,
        ]);
        
        return back()->with('success', 'Added to cart!');
    }

    public function checkout(){
        $cartItems = Cart::with(['product','product.stocks' => function($query) {
            $query->orderby('created_at', 'asc')->limit(1);
        }])->where('customer_id', Auth::id())
        ->orderby('created_at', 'desc')->get();

        return Inertia::render('Customer/Checkout',[
            'carts' => $cartItems,
        ]); 
    }

    public function removeFromCart(Request $request, $cart_id){
        // Logic to remove product from cart for the customer
        $cartItem = Cart::where('id', $cart_id)
            ->where('customer_id', Auth::id())
            ->first();

        if ($cartItem) {
            $cartItem->delete();
        }
        //return redirect()->intended('/');
        return back()->with('success', 'Product removed from cart successfully!');
    }

    public function updateCartQuantity(Request $request, $cart_id){
       // dd($request->all());
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
