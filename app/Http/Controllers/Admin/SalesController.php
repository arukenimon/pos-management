<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Inventory;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class SalesController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with([
            'cashier:id,name',
            'items.variant.product:id,name,images',
            'items.variant.attributeValues.attribute',
        ])->orderBy('created_at', 'desc');

        if ($search = $request->query('search')) {
            $query->whereHas('cashier', fn ($q) => $q->where('name', 'like', "%{$search}%"))
                  ->orWhere('id', $search);
        }

        if ($method = $request->query('payment_method')) {
            $query->where('payment_method', $method);
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $orders = $query->paginate(20)->withQueryString();

        $completed = Order::where('status', 'completed');
        $analytics = [
            'total_sales'   => (clone $completed)->count(),
            'total_revenue' => (float) (clone $completed)->sum('total'),
            'today_sales'   => (clone $completed)->whereDate('created_at', today())->count(),
            'today_revenue' => (float) (clone $completed)->whereDate('created_at', today())->sum('total'),
            'total_profit'  => (float) DB::table('order_items')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.shop_id', app('current_shop')->id)
                ->where('orders.status', 'completed')
                ->whereNotNull('order_items.cost_price')
                ->sum(DB::raw('order_items.subtotal - order_items.cost_price * order_items.quantity')),
            'today_profit'  => (float) DB::table('order_items')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.shop_id', app('current_shop')->id)
                ->where('orders.status', 'completed')
                ->whereNotNull('order_items.cost_price')
                ->whereDate('orders.created_at', today())
                ->sum(DB::raw('order_items.subtotal - order_items.cost_price * order_items.quantity')),
            'corrections_count' => Order::whereIn('status', ['voided', 'refunded'])->count(),
            'corrections_total' => (float) Order::whereIn('status', ['voided', 'refunded'])->sum('total'),
        ];

        return Inertia::render('Auth/Admin/Sales/Index', [
            'orders'    => $orders,
            'filters'   => $request->only(['search', 'payment_method', 'status']),
            'analytics' => $analytics,
        ]);
    }

    public function show($shop, $id)
    {
        $order = Order::with([
            'cashier:id,name',
            'items.variant.product:id,name,images',
            'items.variant.attributeValues.attribute',
        ])->findOrFail($id);

        return Inertia::render('Auth/Admin/Sales/Show', [
            'order' => $order,
        ]);
    }

    public function receipt($shop, $id)
    {
        $order = Order::with(['cashier:id,name', 'items.variant.product:id,name', 'items.variant.attributeValues.attribute'])
            ->findOrFail($id);

        return view('receipts.order', ['order' => $order, 'shop' => app('current_shop')]);
    }

    public function receiptPdf($shop, $id)
    {
        $order = Order::with(['cashier:id,name', 'items.variant.product:id,name', 'items.variant.attributeValues.attribute'])->findOrFail($id);
        return Pdf::loadView('receipts.order-pdf', ['order' => $order, 'shop' => app('current_shop')])
            ->setPaper([0, 0, 226.77, 600], 'portrait')
            ->download('receipt-' . str_pad($order->id, 5, '0', STR_PAD_LEFT) . '.pdf');
    }

    public function reportPdf()
    {
        // Dompdf holds the whole document layout in memory. Keep the printable
        // transaction list bounded while calculating the business totals from
        // every sale in this shop. CSV remains the full line-by-line export.
        $orders = Order::query();
        $completed = (clone $orders)->where('status', 'completed');
        $totalOrders = (clone $orders)->count();
        $listedOrders = (clone $orders)
            ->with('cashier:id,name')
            ->orderByDesc('created_at')
            ->limit(200)
            ->get();

        return Pdf::loadView('reports.sales', [
            'shop' => app('current_shop'),
            'orders' => $listedOrders,
            'netRevenue' => (float) (clone $completed)->sum('total'),
            'netSales' => (clone $completed)->count(),
            'totalOrders' => $totalOrders,
        ])
            ->setPaper('a4', 'landscape')->download('sales-report-' . now()->format('Y-m-d') . '.pdf');
    }

    public function export(Request $request)
    {
        $filename = 'sales-' . app('current_shop')->slug . '-' . now()->format('Y-m-d') . '.csv';
        return response()->streamDownload(function () {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Order ID', 'Date', 'Status', 'Cashier', 'Payment', 'Product', 'SKU', 'Quantity', 'Unit Price', 'Line Total', 'Order Total', 'Correction Reason']);
            Order::with(['cashier:id,name', 'items.variant.product:id,name'])
                ->orderByDesc('created_at')->chunk(200, function ($orders) use ($out) {
                    foreach ($orders as $order) foreach ($order->items as $item) {
                        fputcsv($out, [$order->id, $order->created_at->toDateTimeString(), $order->status, $order->cashier?->name, $order->payment_method, $item->variant?->product?->name, $item->variant?->sku, $item->quantity, $item->unit_price, $item->subtotal, $order->total, $order->correction_reason]);
                    }
                });
            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    public function void(Request $request, $shop, $id)
    {
        return $this->correct($request, $id, 'voided');
    }

    public function refund(Request $request, $shop, $id)
    {
        return $this->correct($request, $id, 'refunded');
    }

    private function correct(Request $request, int $id, string $status)
    {
        $data = $request->validate(['reason' => ['nullable', 'string', 'max:500']]);

        DB::transaction(function () use ($id, $status, $data, $request) {
            $order = Order::with('items')->lockForUpdate()->findOrFail($id);

            if ($order->status !== 'completed') {
                abort(422, 'Only completed sales can be voided or refunded.');
            }

            $saleMovements = StockMovement::where('reference_type', Order::class)
                ->where('reference_id', $order->id)
                ->where('type', 'sale')
                ->lockForUpdate()
                ->get();

            foreach ($saleMovements as $movement) {
                $inventory = $movement->inventory_id
                    ? Inventory::withoutGlobalScopes()->lockForUpdate()->find($movement->inventory_id)
                    : null;

                if (! $inventory) {
                    $item = $order->items->firstWhere('product_variant_id', $movement->product_variant_id);
                    $inventory = Inventory::withoutGlobalScopes()->create([
                        'shop_id' => $order->shop_id,
                        'product_variant_id' => $movement->product_variant_id,
                        'quantity' => 0,
                        'cost_price' => $item?->cost_price ?? 0,
                    ]);
                }

                $quantity = abs($movement->quantity);
                $inventory->increment('quantity', $quantity);

                StockMovement::create([
                    'product_variant_id' => $movement->product_variant_id,
                    'inventory_id' => $inventory->id,
                    'type' => 'adjustment',
                    'quantity' => $quantity,
                    'reference_type' => Order::class,
                    'reference_id' => $order->id,
                    'note' => ucfirst($status) . " order #{$order->id}" . (! empty($data['reason']) ? ": {$data['reason']}" : ''),
                    'performed_by' => $request->user()->id,
                ]);
            }

            $order->update([
                'status' => $status,
                'corrected_at' => now(),
                'correction_reason' => $data['reason'] ?? null,
            ]);
        });

        return back()->with('success', 'Order ' . $status . ' and stock restored.');
    }
}
