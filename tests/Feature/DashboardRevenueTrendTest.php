<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardRevenueTrendTest extends TestCase
{
    use RefreshDatabase;

    public function test_chart_includes_only_completed_sales_in_this_shop_and_fills_missing_days(): void
    {
        $this->travelTo(now()->setDate(2026, 10, 25)->setTime(12, 0));
        $shop = Shop::create(['name' => 'Chart Shop', 'slug' => 'chart-shop']);
        $otherShop = Shop::create(['name' => 'Other Shop', 'slug' => 'other-shop']);
        $owner = User::factory()->create();
        $shop->members()->attach($owner->id, ['role' => 'owner']);

        Order::withoutEvents(function () use ($shop, $otherShop, $owner) {
            foreach ([
                [$shop, 100, 'completed', 0],
                [$shop, 50, 'completed', 0],
                [$shop, 30, 'completed', 13],
                [$shop, 500, 'voided', 0],
                [$shop, 900, 'completed', 14],
                [$otherShop, 1000, 'completed', 0],
            ] as [$saleShop, $total, $status, $daysAgo]) {
                $order = new Order([
                    'shop_id' => $saleShop->id,
                    'cashier_id' => $owner->id,
                    'total' => $total,
                    'status' => $status,
                    'payment_method' => 'card',
                ]);
                $order->created_at = now()->subDays($daysAgo);
                $order->save();
            }
        });

        $this->actingAs($owner)->get('/chart-shop')->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Auth/Admin/AdminDashboard')
                ->has('revenueTrend', 14)
                ->where('revenueTrend.0.date', 'Oct 12')
                ->where('revenueTrend.0.revenue', 30)
                ->where('revenueTrend.0.orders', 1)
                ->where('revenueTrend.1.revenue', 0)
                ->where('revenueTrend.1.orders', 0)
                ->where('revenueTrend.13.date', 'Oct 25')
                ->where('revenueTrend.13.revenue', 150)
                ->where('revenueTrend.13.orders', 2)
            );
    }
}
