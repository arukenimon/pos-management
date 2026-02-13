<?php

namespace App\Http\Controllers\Admin\Admin;

use App\Http\Controllers\Controller;
use App\Models\products;
use App\Models\stocks;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProductController extends Controller
{
    //
    


    function ProductsPage(Request $request){
        $search = $request->query('search');
        $status = $request->query('status');
           $products = Products::query()
        ->with('stocks')
        ->when($search, fn ($q) =>
            $q->where('name', 'like', "%{$search}%")
        )
        ->when($status, function ($q, $status) {
            if ($status === 'safe') {
                $q->whereHas('stocks', function ($sq) {
                    $sq->select('product_id')
                    ->groupBy('product_id')
                    ->havingRaw('SUM(quantity) > 10');
                });
            } elseif ($status === 'low') {
                $q->whereHas('stocks', function ($sq) {
                    $sq->select('product_id')
                    ->groupBy('product_id')
                    ->havingRaw('SUM(quantity) BETWEEN 1 AND 10');
                });
            } elseif ($status === 'critical') {
                $q->where(function ($query) {
                    // Products with NO stock rows
                    $query->whereDoesntHave('stocks')
                    // OR products with stock but total = 0
                    ->orWhereHas('stocks', function ($sq) {
                        $sq->select('product_id')
                        ->groupBy('product_id')
                        ->havingRaw('SUM(quantity) = 0');
                    });
                });
            }
        })->orderBy('created_at', 'desc')
        ->get();
        return Inertia::render('Auth/Admin/Products/Index', [
            'products' => $products,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'analytics' => [
                'total' => Products::count(),
                'safe' => Products::whereHas('stocks', function ($q) {
                    $q->select('product_id')
                      ->groupBy('product_id')
                      ->havingRaw('SUM(quantity) > 10');
                })->count(),
                'low' => Products::whereHas('stocks', function ($q) {
                    $q->select('product_id')
                      ->groupBy('product_id')
                      ->havingRaw('SUM(quantity) BETWEEN 1 AND 10');
                })->count(),
                'critical' => Products::whereHas('stocks', function ($q) {
                    $q->select('product_id')
                      ->groupBy('product_id')
                      ->havingRaw('SUM(quantity) = 0');
                })->count(),
                'active' => Products::where('status', 'active')->count(),
                'inactive' => Products::where('status', 'inactive')->count(),
            ],
        ]);
    }

    function DeleteProductStock($id){
        $product = stocks::findOrFail($id);
        $product->delete();

        return redirect()->route('admin.products.index');
    }

    function AddStock(Request $request, $id){
        $request->validate([
            'quantity' => 'required|integer|min:1',
            'price' => 'required|integer|min:1',
            
        ]);

        stocks::insert([
            'product_id' => $id,
            'quantity' => $request->quantity,
            'price' => $request->price,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return redirect()->route('admin.products.index');
    }

    function AddProductPage(){

       

        return Inertia::render('Auth/Admin/Products/ModifyProduct');
    }

    function EditProductPage($id){

        $product = Products::findOrFail($id);

        return Inertia::render('Auth/Admin/Products/ModifyProduct',[
            'product' => $product
        ]);
    }

    function StoreProduct(Request $request){

         $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sku' => 'nullable|string|max:100',
            'images' => 'nullable|array',
            'images.*' => 'string',
        ]);

        
        try{
            DB::beginTransaction();
            
            Products::create([
                'name' => $request->name,
                'description' => $request->description,
                'sku' => $request->sku,
                'images' => $request->input('images', []),
            ]);
            DB::commit();
        }catch(\Exception $e){
            DB::rollBack();
            return back()->with('error', 'Failed to adding product: ' . $e->getMessage());
        }

        return redirect()->route('admin.products.index')->with('success', 'Product added successfully');
    }
    function UpdateProduct(Request $request, $id){
         $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sku' => 'nullable|string|max:100',
            'images' => 'nullable|array',
            'images.*' => 'string',
        ]);
        try{
            DB::beginTransaction();
            $product = Products::findOrFail($id);
            $product->update([
                'name' => $request->name,
                'description' => $request->description,
                'sku' => $request->sku,
            ]);

            
    
            $product->update([
                'images' => $request->input('images', $product->images ?? []),
            ]);

            DB::commit();
        }
        catch(\Exception $e){
            DB::rollBack();
            return back()->with('error', 'Failed to update product: ' . $e->getMessage());
        }

        return redirect()->route('admin.products.index')->with('success', 'Product updated successfully');
    }
}
