<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $today = today();

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

        return Inertia::render('Auth/Admin/AdminDashboard', [
            'stats'           => $stats,
            'recentMovements' => $recentMovements,
        ]);
    }
}
