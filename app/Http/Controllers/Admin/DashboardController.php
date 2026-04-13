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

        $stats = [
            'total_revenue'       => (float) Order::sum('total'),
            'total_orders'        => Order::count(),
            'today_revenue'       => (float) Order::whereDate('created_at', $today)->sum('total'),
            'today_orders'        => Order::whereDate('created_at', $today)->count(),
            'avg_order_value'     => (float) (Order::count() > 0 ? Order::avg('total') : 0),
            'total_customers'     => User::where('role', 'customer')->count(),
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
