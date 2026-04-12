<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PosController extends Controller
{
    public function index()
    {
        $products = Product::with([
            'variants.inventories',
            'variants.attributeValues.attribute',
        ])->where('status', 'active')
          ->get()
          ->map(function ($product) {
              $product->variants = $product->variants->map(function ($variant) {
                  $variant->total_stock = $variant->inventories->sum('quantity');
                  return $variant;
              })->filter(fn ($v) => $v->total_stock > 0)->values();
              return $product;
          })->filter(fn ($p) => $p->variants->count() > 0)->values();

        return Inertia::render('Auth/Admin/POS/Index', [
            'products' => $products,
        ]);
    }

    public function checkout(Request $request)
    {
        $request->validate([
            'items'              => 'required|array|min:1',
            'items.*.variant_id' => 'required|integer|exists:product_variants,id',
            'items.*.quantity'   => 'required|integer|min:1',
            'payment_method'     => 'required|in:cash,card',
            'cash_received'      => 'nullable|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            $total = 0;

            // Pre-calculate totals and validate stock before touching anything
            $lines = [];
            foreach ($request->items as $item) {
                $variant    = ProductVariant::findOrFail($item['variant_id']);
                $totalStock = $variant->inventories()->sum('quantity');

                if ($totalStock < $item['quantity']) {
                    DB::rollBack();
                    return back()->withErrors(['items' => "Insufficient stock for SKU: {$variant->sku}"]);
                }

                $unitPrice = (float) $variant->price;
                $subtotal  = $unitPrice * $item['quantity'];
                $total    += $subtotal;

                $lines[] = compact('variant', 'unitPrice', 'subtotal') + ['quantity' => $item['quantity']];
            }

            // Create the order record
            $cashReceived = $request->payment_method === 'cash' ? (float) $request->cash_received : null;
            $order = Order::create([
                'cashier_id'     => Auth::id(),
                'total'          => $total,
                'payment_method' => $request->payment_method,
                'cash_received'  => $cashReceived,
                'change_given'   => $cashReceived !== null ? $cashReceived - $total : null,
            ]);

            // Deduct stock FIFO and create order items
            foreach ($lines as $line) {
                OrderItem::create([
                    'order_id'           => $order->id,
                    'product_variant_id' => $line['variant']->id,
                    'quantity'           => $line['quantity'],
                    'unit_price'         => $line['unitPrice'],
                    'subtotal'           => $line['subtotal'],
                ]);

                $remaining = $line['quantity'];
                foreach ($line['variant']->inventories()->where('quantity', '>', 0)->orderBy('created_at', 'asc')->get() as $inv) {
                    if ($remaining <= 0) break;
                    $deduct = min($remaining, $inv->quantity);
                    $inv->decrement('quantity', $deduct);

                    StockMovement::create([
                        'product_variant_id' => $line['variant']->id,
                        'inventory_id'       => $inv->id,
                        'type'               => 'sale',
                        'quantity'           => -$deduct,
                        'reference_type'     => Order::class,
                        'reference_id'       => $order->id,
                        'performed_by'       => Auth::id(),
                    ]);

                    $remaining -= $deduct;
                }
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Checkout failed: ' . $e->getMessage()]);
        }

        return back()->with('success', 'Sale completed successfully!');
    }
}

