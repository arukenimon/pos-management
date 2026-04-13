<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->query('period', '30');

        $days  = match ($period) {
            'today' => 1,
            '7'     => 7,
            '90'    => 90,
            default => 30,
        };

        $from = $days === 1
            ? now()->startOfDay()
            : now()->subDays($days - 1)->startOfDay();

        // ── Summary KPIs ─────────────────────────────────────────────────────
        $periodOrders  = Order::where('created_at', '>=', $from);
        $totalRevenue  = (float) (clone $periodOrders)->sum('total');
        $totalOrders   = (clone $periodOrders)->count();
        $avgOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;
        $totalUnitsSold = (int) OrderItem::whereHas(
            'order', fn ($q) => $q->where('created_at', '>=', $from)
        )->sum('quantity');
        $totalProfit = (float) DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.created_at', '>=', $from)
            ->whereNotNull('order_items.cost_price')
            ->sum(DB::raw('order_items.subtotal - order_items.cost_price * order_items.quantity'));

        // ── Revenue trend (per day) ───────────────────────────────────────────
        $profitByDate = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.created_at', '>=', $from)
            ->whereNotNull('order_items.cost_price')
            ->select(
                DB::raw('DATE(orders.created_at) as date'),
                DB::raw('SUM(order_items.subtotal - order_items.cost_price * order_items.quantity) as profit')
            )
            ->groupBy('date')
            ->get()
            ->keyBy('date');

        $revenueTrend = Order::where('created_at', '>=', $from)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($r) => [
                'date'    => $r->date,
                'revenue' => (float) $r->revenue,
                'orders'  => (int) $r->orders,
                'profit'  => isset($profitByDate[$r->date]) ? (float) $profitByDate[$r->date]->profit : null,
            ]);

        // ── Top products by quantity sold ─────────────────────────────────────
        $topProducts = OrderItem::whereHas(
            'order', fn ($q) => $q->where('created_at', '>=', $from)
        )
        ->select(
            'product_variant_id',
            DB::raw('SUM(quantity) as units_sold'),
            DB::raw('SUM(subtotal) as revenue')
        )
        ->groupBy('product_variant_id')
        ->orderByDesc('units_sold')
        ->limit(10)
        ->with('variant.product:id,name', 'variant.attributeValues.attribute')
        ->get()
        ->map(fn ($item) => [
            'name'       => $item->variant?->product?->name ?? 'Unknown',
            'variant'    => $item->variant?->attributeValues
                ? $item->variant->attributeValues->map(fn ($av) => $av->value)->join(' / ')
                : ($item->variant?->sku ?? ''),
            'units_sold' => (int) $item->units_sold,
            'revenue'    => (float) $item->revenue,
        ]);

        // ── Payment method split ──────────────────────────────────────────────
        $paymentSplit = Order::where('created_at', '>=', $from)
            ->select(
                'payment_method',
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(total) as revenue')
            )
            ->groupBy('payment_method')
            ->get()
            ->map(fn ($r) => [
                'method'  => ucfirst($r->payment_method),
                'count'   => (int) $r->count,
                'revenue' => (float) $r->revenue,
            ]);

        // ── Stock movement trend (per day) ────────────────────────────────────
        $stockTrend = StockMovement::where('created_at', '>=', $from)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(CASE WHEN quantity > 0 THEN quantity ELSE 0 END) as stock_in'),
                DB::raw('SUM(CASE WHEN quantity < 0 THEN ABS(quantity) ELSE 0 END) as stock_out')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($r) => [
                'date'      => $r->date,
                'stock_in'  => (int) $r->stock_in,
                'stock_out' => (int) $r->stock_out,
            ]);

        // ── Hourly sales distribution ─────────────────────────────────────────
        $hourlySales = Order::where('created_at', '>=', $from)
            ->select(
                DB::raw('HOUR(created_at) as hour'),
                DB::raw('COUNT(*) as orders'),
                DB::raw('SUM(total) as revenue')
            )
            ->groupBy('hour')
            ->orderBy('hour')
            ->get()
            ->map(fn ($r) => [
                'hour'    => sprintf('%02d:00', $r->hour),
                'orders'  => (int) $r->orders,
                'revenue' => (float) $r->revenue,
            ]);

        return Inertia::render('Auth/Admin/Analytics/Index', [
            'period'       => $period,
            'summary'      => compact('totalRevenue', 'totalOrders', 'avgOrderValue', 'totalUnitsSold', 'totalProfit'),
            'revenueTrend' => $revenueTrend,
            'topProducts'  => $topProducts,
            'paymentSplit' => $paymentSplit,
            'stockTrend'   => $stockTrend,
            'hourlySales'  => $hourlySales,
        ]);
    }
}
