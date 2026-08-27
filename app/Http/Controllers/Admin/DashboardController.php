<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\StockMovement;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $today = today();
        $shop = app('current_shop');
        $lowStockThreshold = (int) ($shop->low_stock_threshold ?? 5);

        $completedOrders = Order::where('status', 'completed');
        $stats = [
            'total_revenue'       => (float) (clone $completedOrders)->sum('total'),
            'total_orders'        => (clone $completedOrders)->count(),
            'today_revenue'       => (float) (clone $completedOrders)->whereDate('created_at', $today)->sum('total'),
            'today_orders'        => (clone $completedOrders)->whereDate('created_at', $today)->count(),
            'avg_order_value'     => (float) ((clone $completedOrders)->count() > 0 ? (clone $completedOrders)->avg('total') : 0),
            'total_members'       => app('current_shop')->members()->count(),
        ];

        $recentMovements = StockMovement::with([
            'variant.product:id,name,images',
            'variant.attributeValues.attribute',
            'performedBy:id,name',
        ])
        ->orderByDesc('created_at')
        ->limit(5)
        ->get()
        ->map(fn ($m) => [
            'id'           => $m->id,
            'type'         => $m->type,
            'quantity'     => $m->quantity,
            'note'         => $m->note,
            'created_at'   => $m->created_at->diffForHumans(),
            'performed_by' => $m->performedBy?->name,
            'variant_sku'  => $m->variant?->sku,
            'product_name' => $m->variant?->product?->name,
            'product_image'=> $m->variant?->product?->images[0] ?? null,
            'variant_label'=> $m->variant?->attributeValues
                ? $m->variant->attributeValues->map(fn ($av) => $av->value)->join(' / ')
                : $m->variant?->sku,
        ]);

        $lowStockItems = Product::with([
            'variants.inventories',
            'variants.attributeValues.attribute',
        ])
        ->where('status', 'active')
        ->get()
        ->flatMap(function (Product $product) {
            return $product->variants->map(function ($variant) use ($product) {
                return [
                    'id'            => $variant->id,
                    'product_name'  => $product->name,
                    'product_image' => $product->images[0] ?? null,
                    'sku'           => $variant->sku,
                    'variant_label' => $variant->attributeValues->isNotEmpty()
                        ? $variant->attributeValues->map(fn ($value) => $value->value)->join(' / ')
                        : null,
                    'quantity'      => (int) $variant->inventories->sum('quantity'),
                ];
            });
        })
        ->filter(fn (array $item) => $item['quantity'] <= $lowStockThreshold)
        ->sortBy([
            ['quantity', 'asc'],
            ['product_name', 'asc'],
        ])
        ->values();

        return Inertia::render('Auth/Admin/AdminDashboard', [
            'stats'           => $stats,
            'recentMovements' => $recentMovements,
            'lowStock'        => [
                'count'     => $lowStockItems->count(),
                'threshold' => $lowStockThreshold,
                'items'     => $lowStockItems->take(5)->values(),
            ],
        ]);
    }
}
