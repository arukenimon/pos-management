<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

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

        $orders = $query->paginate(20)->withQueryString();

        $analytics = [
            'total_sales'   => Order::count(),
            'total_revenue' => (float) Order::sum('total'),
            'today_sales'   => Order::whereDate('created_at', today())->count(),
            'today_revenue' => (float) Order::whereDate('created_at', today())->sum('total'),
            'total_profit'  => (float) DB::table('order_items')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.shop_id', app('current_shop')->id)
                ->whereNotNull('order_items.cost_price')
                ->sum(DB::raw('order_items.subtotal - order_items.cost_price * order_items.quantity')),
            'today_profit'  => (float) DB::table('order_items')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.shop_id', app('current_shop')->id)
                ->whereNotNull('order_items.cost_price')
                ->whereDate('orders.created_at', today())
                ->sum(DB::raw('order_items.subtotal - order_items.cost_price * order_items.quantity')),
        ];

        return Inertia::render('Auth/Admin/Sales/Index', [
            'orders'    => $orders,
            'filters'   => $request->only(['search', 'payment_method']),
            'analytics' => $analytics,
        ]);
    }

    public function show($id)
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
}
