<?php

namespace App\Http\Controllers\Admin\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Variant;
use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProductController extends Controller
{
    //
    


    function Inventory(Request $request){
        $search = $request->query('search');
        $status = $request->query('status');
           $products = Product::query()
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
        return Inertia::render('Auth/Admin/Products/Inventory', [
            'products' => $products,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'analytics' => [
                'total' => Product::count(),
                'safe' => Product::whereHas('stocks', function ($q) {
                    $q->select('product_id')
                      ->groupBy('product_id')
                      ->havingRaw('SUM(quantity) > 10');
                })->count(),
                'low' => Product::whereHas('stocks', function ($q) {
                    $q->select('product_id')
                      ->groupBy('product_id')
                      ->havingRaw('SUM(quantity) BETWEEN 1 AND 10');
                })->count(),
                'critical' => Product::whereHas('stocks', function ($q) {
                    $q->select('product_id')
                      ->groupBy('product_id')
                      ->havingRaw('SUM(quantity) = 0');
                })->count(),
                'active' => Product::where('status', 'active')->count(),
                'inactive' => Product::where('status', 'inactive')->count(),
            ],
        ]);
    }

    function DeleteProductStock($id){
        $product = Stock::findOrFail($id);
        $product->delete();

        return redirect()->route('admin.products.inventory');
    }

    function AddStock(Request $request, $id){
        $request->validate([
            'quantity' => 'required|integer|min:1',
            'price' => 'required|integer|min:1',
            
        ]);

        Stock::insert([
            'product_id' => $id,
            'quantity' => $request->quantity,
            'price' => $request->price,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return redirect()->route('admin.products.inventory');
    }

    function AddProductPage(){

       

        return Inertia::render('Auth/Admin/Products/ModifyProduct');
    }

    function EditProductPage($id){

        $product = Product::with(['variants'])->findOrFail($id);

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

            'variants' => 'nullable|array',
            'variants.*.name' => 'required|string|max:255',
            'variants.*.base_price' => 'required|numeric|min:0',
            'variants.*.cost_each' => 'required|numeric|min:0',
            'variants.*.product_id' => 'required|exists:products,id'
        ]);

        dd($request->all());
        
        try{
            DB::beginTransaction();
            
            Product::create([
                'name' => $request->name,
                'description' => $request->description,
                'sku' => $request->sku,
                'images' => $request->input('images', []),
            ]);

            Variant::create([
                'name' => 'Default Variant',
                'base_price' => 0,
                'cost_each' => 0,
                'product_id' => $product->id,
            ]);

            DB::commit();
        }catch(\Exception $e){
            DB::rollBack();
            return back()->with('error', 'Failed to adding product: ' . $e->getMessage());
        }

        return redirect()->route('admin.products.inventory')->with('success', 'Product added successfully');
    }
    function UpdateProduct(Request $request, $id){
         $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sku' => 'nullable|string|max:100',
            'images' => 'nullable|array',
            'images.*' => 'string',

            'variants' => 'nullable|array',
            'variants.*.name' => 'required|string|max:255',
            'variants.*.base_price' => 'required|numeric|min:0',
            'variants.*.cost_each' => 'required|numeric|min:0',
        ]);
        // dd($request->all());
        try{
            DB::beginTransaction();
            $product = Product::findOrFail($id);
            $product->update([
                'name' => $request->name,
                'description' => $request->description,
                'sku' => $request->sku,
            ]);

            if ($request->has('variants')) {
                foreach ($request->input('variants') as $variantData) {
                    $variant = Variant::find($variantData['id']);
                    if($variant){
                        $variant->update([
                            'name' => $variantData['name'],
                            'base_price' => $variantData['base_price'],
                            'cost_each' => $variantData['cost_each'],
                        ]);
                    } else {
                        Variant::create([
                            'name' => $variantData['name'],
                            'base_price' => $variantData['base_price'],
                            'cost_each' => $variantData['cost_each'],
                            'product_id' => $product->id,
                        ]);
                    }
                }
            }
    
            $product->update([
                'images' => $request->input('images', $product->images ?? []),
            ]);

            DB::commit();
        }
        catch(\Exception $e){
            DB::rollBack();
            return back()->with('error', 'Failed to update product: ' . $e->getMessage());
        }

        return redirect()->route('admin.products.inventory')->with('success', 'Product updated successfully');
    }
}
