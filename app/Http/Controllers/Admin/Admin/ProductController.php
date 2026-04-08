<?php

namespace App\Http\Controllers\Admin\Admin;

use App\Http\Controllers\Controller;
//ProductController ;
use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProductController extends Controller
{
    function Inventory(Request $request)
    {
        $search = $request->query('search');
        $status = $request->query('status');

        $products = Product::query()
            ->with(['variants.inventories', 'variants.attributeValues.attribute'])
            ->when($search, fn($q) => $q->where('name', 'like', "%{$search}%"))
            ->when($status, function ($q, $status) {
                if ($status === 'safe') {
                    $q->whereHas('variants.inventories', function ($sq) {
                        $sq->select('product_variant_id')
                            ->groupBy('product_variant_id')
                            ->havingRaw('SUM(quantity) > 10');
                    });
                } elseif ($status === 'low') {
                    $q->whereHas('variants.inventories', function ($sq) {
                        $sq->select('product_variant_id')
                            ->groupBy('product_variant_id')
                            ->havingRaw('SUM(quantity) BETWEEN 1 AND 10');
                    });
                } elseif ($status === 'critical') {
                    $q->where(function ($query) {
                        $query->whereDoesntHave('variants')
                            ->orWhereHas('variants', function ($vq) {
                                $vq->whereDoesntHave('inventories')
                                    ->orWhereHas('inventories', function ($iq) {
                                        $iq->select('product_variant_id')
                                            ->groupBy('product_variant_id')
                                            ->havingRaw('SUM(quantity) = 0');
                                    });
                            });
                    });
                }
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Auth/Admin/Products/Inventory', [
            'products'  => $products,
            'filters'   => ['search' => $search, 'status' => $status],
            'analytics' => [
                'total'    => Product::count(),
                'active'   => Product::where('status', 'active')->count(),
                'inactive' => Product::where('status', 'inactive')->count(),
            ],
        ]);
    }

    function DeleteProductStock($id)
    {
        Inventory::findOrFail($id)->delete();

        return redirect()->route('admin.products.inventory');
    }

    function AddStock(Request $request, $variant_id)
    {
        $request->validate([
            'quantity'   => 'required|integer|min:1',
            'cost_price' => 'required|numeric|min:0',
        ]);

        $variant = \App\Models\ProductVariant::findOrFail($variant_id);

        Inventory::create([
            'product_variant_id' => $variant_id,
            'quantity'           => $request->quantity,
            'cost_price'         => $request->cost_price,
            'selling_price'      => $variant->price ?? 0,
        ]);

        return redirect()->route('admin.products.inventory');
    }

    function AddProductPage()
    {
        $attributes = Attribute::with('values')->get();

        return Inertia::render('Auth/Admin/Products/ModifyProduct', [
            'attributes' => $attributes,
        ]);
    }

    function EditProductPage($id)
    {
        $product = Product::with([
            'variants.inventories',
            'variants.attributeValues.attribute',
        ])->findOrFail($id);

        $attributes = Attribute::with('values')->get();

        return Inertia::render('Auth/Admin/Products/ModifyProduct', [
            'product'    => $product,
            'attributes' => $attributes,
        ]);
    }

    function StoreProduct(Request $request)
    {
        $request->validate([
            'name'                              => 'required|string|max:255',
            'description'                       => 'nullable|string',
            'images'                            => 'nullable|array',
            'images.*'                          => 'string',
            'variants'                          => 'required|array|min:1',
            'variants.*.sku'                    => 'required|string|max:100|distinct',
            'variants.*.price'                  => 'required|numeric|min:0',
            'variants.*.attribute_value_ids'    => 'nullable|array',
            'variants.*.attribute_value_ids.*'  => 'integer|exists:attribute_values,id',
        ]);

        try {
            DB::beginTransaction();

            $product = Product::create([
                'name'        => $request->name,
                'description' => $request->description,
                'images'      => $request->input('images', []),
            ]);

            foreach ($request->variants as $variantData) {
                $variant = ProductVariant::create([
                    'product_id' => $product->id,
                    'sku'        => $variantData['sku'],
                    'price'      => $variantData['price'] ?? null,
                ]);

                if (!empty($variantData['attribute_value_ids'])) {
                    $variant->attributeValues()->sync($variantData['attribute_value_ids']);
                }
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to add product: ' . $e->getMessage());
        }

        return redirect()->route('admin.products.inventory')->with('success', 'Product added successfully');
    }

    function UpdateProduct(Request $request, $id)
    {
        $request->validate([
            'name'                              => 'required|string|max:255',
            'description'                       => 'nullable|string',
            'images'                            => 'nullable|array',
            'images.*'                          => 'string',
            'variants'                          => 'nullable|array',
            'variants.*.id'                     => 'nullable|integer|exists:product_variants,id',
            'variants.*.sku'                    => 'required|string|max:100',
            'variants.*.price'                  => 'required|numeric|min:0',
            'variants.*.attribute_value_ids'    => 'nullable|array',
            'variants.*.attribute_value_ids.*'  => 'integer|exists:attribute_values,id',
        ]);

        try {
            DB::beginTransaction();

            $product = Product::findOrFail($id);
            $product->update([
                'name'        => $request->name,
                'description' => $request->description,
                'images'      => $request->input('images', $product->images ?? []),
            ]);

            $submittedVariantIds = collect($request->input('variants', []))
                ->pluck('id')
                ->filter()
                ->values();

            // Delete variants that were removed on the frontend
            $product->variants()->whereNotIn('id', $submittedVariantIds)->each(function ($v) {
                $v->inventories()->delete();
                $v->attributeValues()->detach();
                $v->delete();
            });

            foreach ($request->input('variants', []) as $variantData) {
                $variant = isset($variantData['id'])
                    ? ProductVariant::find($variantData['id'])
                    : null;

                if ($variant) {
                    $variant->update([
                        'sku'   => $variantData['sku'],
                        'price' => $variantData['price'],
                    ]);
                } else {
                    $variant = ProductVariant::create([
                        'product_id' => $product->id,
                        'sku'        => $variantData['sku'],
                        'price'      => $variantData['price'],
                    ]);
                }

                $variant->attributeValues()->sync($variantData['attribute_value_ids'] ?? []);
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to update product: ' . $e->getMessage());
        }

        return redirect()->route('admin.products.inventory')->with('success', 'Product updated successfully');
    }
}
