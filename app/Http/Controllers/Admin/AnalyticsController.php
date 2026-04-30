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

        $isYear = $period === 'year';

        $days  = match ($period) {
            'today' => 1,
            '7'     => 7,
            '90'    => 90,
            'year'  => 365,
            default => 30,
        };

        $from = $period === 'today'
            ? now()->startOfDay()
            : ($isYear ? now()->startOfYear() : now()->subDays($days - 1)->startOfDay());

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
            ->where('orders.shop_id', app('current_shop')->id)
            ->where('orders.created_at', '>=', $from)
            ->whereNotNull('order_items.cost_price')
            ->sum(DB::raw('order_items.subtotal - order_items.cost_price * order_items.quantity'));

        // ── Revenue trend — full skeleton filled with zeros ───────────────────
        if ($isYear) {
            // Monthly skeleton: Jan–Dec
            $profitBySlot = DB::table('order_items')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.shop_id', app('current_shop')->id)
                ->where('orders.created_at', '>=', $from)
                ->whereNotNull('order_items.cost_price')
                ->select(
                    DB::raw("DATE_FORMAT(orders.created_at, '%Y-%m') as slot"),
                    DB::raw('SUM(order_items.subtotal - order_items.cost_price * order_items.quantity) as profit')
                )
                ->groupBy('slot')->get()->keyBy('slot');

            $rowsBySlot = Order::where('created_at', '>=', $from)
                ->select(
                    DB::raw("DATE_FORMAT(created_at, '%Y-%m') as slot"),
                    DB::raw('SUM(total) as revenue'),
                    DB::raw('COUNT(*) as orders')
                )
                ->groupBy('slot')->get()->keyBy('slot');

            $currentYear = now()->year;
            $revenueTrend = collect(range(1, 12))->map(function (int $m) use ($currentYear, $rowsBySlot, $profitBySlot) {
                $slot = sprintf('%d-%02d', $currentYear, $m);
                $row  = $rowsBySlot->get($slot);
                return [
                    'date'    => date('M', mktime(0, 0, 0, $m, 1)),
                    'revenue' => $row ? (float) $row->revenue : 0,
                    'orders'  => $row ? (int)   $row->orders  : 0,
                    'profit'  => isset($profitBySlot[$slot]) ? (float) $profitBySlot[$slot]->profit : 0,
                ];
            });

        } elseif ($period === 'today') {
            // Hourly skeleton: 00:00–23:00
            $profitBySlot = DB::table('order_items')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.shop_id', app('current_shop')->id)
                ->where('orders.created_at', '>=', $from)
                ->whereNotNull('order_items.cost_price')
                ->select(
                    DB::raw('HOUR(orders.created_at) as slot'),
                    DB::raw('SUM(order_items.subtotal - order_items.cost_price * order_items.quantity) as profit')
                )
                ->groupBy('slot')->get()->keyBy('slot');

            $rowsBySlot = Order::where('created_at', '>=', $from)
                ->select(
                    DB::raw('HOUR(created_at) as slot'),
                    DB::raw('SUM(total) as revenue'),
                    DB::raw('COUNT(*) as orders')
                )
                ->groupBy('slot')->get()->keyBy('slot');

            $revenueTrend = collect(range(0, 23))->map(function (int $h) use ($rowsBySlot, $profitBySlot) {
                $row = $rowsBySlot->get($h);
                return [
                    'date'    => sprintf('%02d:00', $h),
                    'revenue' => $row ? (float) $row->revenue : 0,
                    'orders'  => $row ? (int)   $row->orders  : 0,
                    'profit'  => isset($profitBySlot[$h]) ? (float) $profitBySlot[$h]->profit : 0,
                ];
            });

        } else {
            // Daily skeleton: every day in the range
            $profitBySlot = DB::table('order_items')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.shop_id', app('current_shop')->id)
                ->where('orders.created_at', '>=', $from)
                ->whereNotNull('order_items.cost_price')
                ->select(
                    DB::raw('DATE(orders.created_at) as slot'),
                    DB::raw('SUM(order_items.subtotal - order_items.cost_price * order_items.quantity) as profit')
                )
                ->groupBy('slot')->get()->keyBy('slot');

            $rowsBySlot = Order::where('created_at', '>=', $from)
                ->select(
                    DB::raw('DATE(created_at) as slot'),
                    DB::raw('SUM(total) as revenue'),
                    DB::raw('COUNT(*) as orders')
                )
                ->groupBy('slot')->get()->keyBy('slot');

            $revenueTrend = collect(\Carbon\CarbonPeriod::create($from->toDateString(), now()->toDateString()))
                ->map(function (\Carbon\Carbon $day) use ($rowsBySlot, $profitBySlot) {
                    $slot = $day->toDateString();
                    $row  = $rowsBySlot->get($slot);
                    return [
                        'date'    => $slot,
                        'revenue' => $row ? (float) $row->revenue : 0,
                        'orders'  => $row ? (int)   $row->orders  : 0,
                        'profit'  => isset($profitBySlot[$slot]) ? (float) $profitBySlot[$slot]->profit : 0,
                    ];
                });
        }

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
