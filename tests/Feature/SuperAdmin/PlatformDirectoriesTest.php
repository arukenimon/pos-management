<?php

namespace Tests\Feature\SuperAdmin;

use App\Models\Order;
use App\Models\PlatformAuditLog;
use App\Models\Product;
use App\Models\Shop;
use App\Models\User;
use App\Services\PlatformAdministration;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PlatformDirectoriesTest extends TestCase
{
    use RefreshDatabase;

    public function test_shop_directory_filters_and_keeps_filters_on_page_two(): void
    {
        $operator = User::factory()->create(['is_super_admin' => true]);
        for ($i = 1; $i <= 28; $i++) {
            Shop::create(['name' => 'Directory shop '.$i, 'slug' => 'directory-'.$i])
                ->forceFill(['suspended_at' => now()])->save();
        }
        Shop::create(['name' => 'Directory active', 'slug' => 'directory-active']);
        $this->actingAs($operator)->get('/super-admin/shops?q=Directory&status=suspended')->assertOk()
            ->assertInertia(fn (Assert $page) => $page->has('shops.data', 25)->where('shops.total', 28)
                ->where('filters.q', 'Directory')->where('filters.status', 'suspended')
                ->where('shops.next_page_url', fn ($url) => str_contains($url, 'q=Directory') && str_contains($url, 'status=suspended')));
        $this->get('/super-admin/shops?q=Directory&status=suspended&page=2')->assertOk()
            ->assertInertia(fn (Assert $page) => $page->has('shops.data', 3));
    }

    public function test_user_directory_filters_by_search_status_and_email_verification(): void
    {
        $operator = User::factory()->create(['is_super_admin' => true]);
        User::factory()->unverified()->create(['name' => 'Directory target', 'suspended_at' => now()]);
        User::factory()->create(['name' => 'Directory verified', 'suspended_at' => now()]);
        User::factory()->unverified()->create(['name' => 'Directory active']);
        $this->actingAs($operator)->get('/super-admin/users?q=Directory&status=suspended&verification=unverified')
            ->assertOk()->assertInertia(fn (Assert $page) => $page->has('users.data', 1)
            ->where('users.data.0.name', 'Directory target')->missing('users.data.0.password')->missing('users.data.0.suspension_reason'));
    }

    public function test_operational_details_count_only_the_selected_shop_and_do_not_expose_business_records(): void
    {
        $operator = User::factory()->create(['is_super_admin' => true]);
        $owner = User::factory()->create();
        $shop = Shop::create(['name' => 'Counted shop', 'slug' => 'counted']);
        $other = Shop::create(['name' => 'Other shop', 'slug' => 'other-counted']);
        $shop->members()->attach($owner, ['role' => 'owner']);
        foreach ([$shop, $other, $other] as $entry) {
            Product::withoutEvents(fn () => Product::create(['shop_id' => $entry->id, 'name' => 'Confidential product name', 'status' => 'active']));
            Order::withoutEvents(fn () => Order::create(['shop_id' => $entry->id, 'cashier_id' => $owner->id, 'total' => 12345, 'payment_method' => 'cash']));
        }
        app()->instance('current_shop', $other);
        $this->actingAs($operator)->get('/super-admin/shops/'.$shop->id)->assertOk()->assertDontSee('Confidential product name')
            ->assertInertia(fn (Assert $page) => $page->where('shop.products_count', 1)->where('shop.orders_count', 1)
                ->where('shop.members_count', 1)->where('members.data.0.shop_role', 'owner')
                ->missing('shop.products')->missing('shop.orders')->missing('shop.revenue')->where('currentShop', null));
        $this->get('/super-admin/users/'.$owner->id)->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('memberships.data.0.id', $shop->id)->where('memberships.data.0.shop_role', 'owner'));
    }

    public function test_overview_uses_actual_totals_and_thirty_day_registrations(): void
    {
        $operator = User::factory()->create(['is_super_admin' => true, 'created_at' => now()->subDays(60)]);
        User::factory()->create(['suspended_at' => now()]);
        Shop::query()->update(['created_at' => now()->subDays(60)]);
        Shop::create(['name' => 'Recent shop', 'slug' => 'recent-shop'])->forceFill(['suspended_at' => now()])->save();
        $this->actingAs($operator)->get('/super-admin')->assertInertia(fn (Assert $page) => $page
            ->where('metrics.shops', Shop::count())->where('metrics.suspendedShops', 1)->where('metrics.newShops', 1)
            ->where('metrics.users', 2)->where('metrics.activeUsers', 1)->where('metrics.suspendedUsers', 1)->where('metrics.newUsers', 1));
    }

    public function test_audit_can_be_filtered_by_actor_target_action_and_date_and_survives_target_deletion(): void
    {
        $operator = User::factory()->create(['is_super_admin' => true, 'name' => 'Support Operator']);
        $target = User::factory()->create(['name' => 'Audit Target']);
        app(PlatformAdministration::class)->setSuspended($target, true, $operator, 'Review account');
        app(PlatformAdministration::class)->setSuspended($target, false, $operator, 'Account cleared');
        $date = now()->toDateString();
        $query = http_build_query(['actor' => 'Support', 'target' => $target->email, 'action' => 'user.restored', 'from' => $date, 'to' => $date]);
        $this->actingAs($operator)->get('/super-admin/audit-log?'.$query)->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('entries.total', 1)->where('entries.data.0.reason', 'Account cleared')
            ->where('entries.data.0.before_state.status', 'suspended')->where('entries.data.0.after_state.status', 'active'));
        $this->get('/super-admin/audit-log?to='.$date)->assertOk();
        $this->from('/super-admin/audit-log')->get('/super-admin/audit-log?from=2026-11-10&to=2026-11-09')->assertSessionHasErrors('to');
        $target->delete();
        $this->assertDatabaseCount('platform_audit_logs', 2);
        $this->assertSame('Audit Target', PlatformAuditLog::first()->target['name']);
    }
}
