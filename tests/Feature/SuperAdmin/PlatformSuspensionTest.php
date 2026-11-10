<?php

namespace Tests\Feature\SuperAdmin;

use App\Models\Inventory;
use App\Models\PlatformAuditLog;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Shop;
use App\Models\User;
use App\Services\PlatformAdministration;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PlatformSuspensionTest extends TestCase
{
    use RefreshDatabase;

    public function test_suspension_blocks_all_shop_routes_and_preserves_other_shop_access(): void
    {
        $operator = User::factory()->create(['is_super_admin' => true]);
        $owner = User::factory()->create(['role' => 'admin']);
        $shop = Shop::create(['name' => 'Suspended shop', 'slug' => 'suspended-shop']);
        $other = Shop::create(['name' => 'Active shop', 'slug' => 'active-shop']);
        $shop->members()->attach($owner, ['role' => 'owner']);
        $other->members()->attach($owner, ['role' => 'owner']);
        $this->actingAs($operator)->patch("/super-admin/shops/{$shop->id}/status", [
            'status' => 'suspended', 'reason' => 'Internal investigation', 'confirmed' => true,
        ])->assertSessionHasNoErrors();
        $this->actingAs($owner);
        foreach (['', '/pos', '/settings', '/settings/team', '/sales', '/sales/export', '/products/inventory/export', '/sales/report.pdf'] as $path) {
            $this->get('/suspended-shop'.$path)->assertForbidden()->assertInertia(fn (Assert $page) => $page
                ->component('ShopSuspended')->where('shopName', $shop->name)->missing('suspension_reason')->missing('auth.user.suspension_reason'));
        }
        foreach (['/pos/checkout', '/products/create', '/pos/shifts/open', '/sales/1/refund'] as $path) {
            $this->post('/suspended-shop'.$path, [])->assertForbidden();
        }
        $this->put('/suspended-shop/settings', [])->assertForbidden();
        $this->delete('/suspended-shop/settings/team/'.$owner->id)->assertForbidden();
        $this->get('/active-shop')->assertOk();
        $this->get('/profile')->assertOk();
        $this->get('/select-shop')->assertOk();
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_status_is_idempotent_audited_and_restorable(): void
    {
        $operator = User::factory()->create(['is_super_admin' => true]);
        $shop = Shop::create(['name' => 'Audit shop', 'slug' => 'audit-shop']);
        $service = app(PlatformAdministration::class);
        $this->assertTrue($service->setSuspended($shop, true, $operator, 'Review required'));
        $this->assertFalse($service->setSuspended($shop, true, $operator, 'Duplicate request'));
        $this->assertDatabaseCount('platform_audit_logs', 1);
        $log = PlatformAuditLog::firstOrFail();
        $this->assertSame(['status' => 'active'], $log->before_state);
        $this->assertSame(['status' => 'suspended'], $log->after_state);
        $this->assertSame($operator->email, $log->actor['email']);
        $this->assertArrayNotHasKey('password', $log->actor);
        $this->assertTrue($service->setSuspended($shop, false, $operator, 'Review complete'));
        $this->assertNull($shop->fresh()->suspended_at);
        $this->assertNull($shop->fresh()->suspension_reason);
        $this->assertDatabaseHas('platform_audit_logs', ['action' => 'shop.restored', 'reason' => 'Review complete']);
    }

    public function test_suspended_accounts_cannot_login_or_continue_existing_web_and_api_sessions(): void
    {
        $operator = User::factory()->create(['is_super_admin' => true]);
        $user = User::factory()->create(['remember_token' => 'old-remember-token']);
        $token = $user->createToken('existing')->plainTextToken;
        app(PlatformAdministration::class)->setSuspended($user, true, $operator, 'Account review');
        $this->assertNotSame('old-remember-token', $user->fresh()->remember_token);
        $this->assertDatabaseCount('personal_access_tokens', 0);
        $this->post('/login', ['email' => $user->email, 'password' => 'password'])->assertSessionHasErrors('email');
        $this->assertGuest();
        $this->actingAs($user->fresh())->get('/profile')->assertRedirect('/login');
        $this->assertGuest();
        $this->getJson('/api/user', ['Authorization' => 'Bearer '.$token])->assertUnauthorized();
        $this->actingAs($user->fresh())->getJson('/api/user')->assertForbidden();
        $this->postJson('/broadcasting/auth', ['channel_name' => 'private-App.Models.User.'.$user->id, 'socket_id' => '123.123'])->assertForbidden();
        app(PlatformAdministration::class)->setSuspended($user, false, $operator, 'Account cleared');
        $this->app['auth']->shouldUse('web');
        $this->app['auth']->forgetGuards();
        $this->post('/login', ['email' => $user->email, 'password' => 'password'])->assertRedirect('/dashboard')->assertSessionHasNoErrors();
        $this->assertAuthenticated();
    }

    public function test_database_sessions_are_invalidated_and_super_admins_are_protected(): void
    {
        config(['session.driver' => 'database']);
        $operator = User::factory()->create(['is_super_admin' => true]);
        $user = User::factory()->create();
        DB::table('sessions')->insert(['id' => 'existing-session', 'user_id' => $user->id, 'payload' => '', 'last_activity' => time()]);
        app(PlatformAdministration::class)->setSuspended($user, true, $operator, 'Session review');
        $this->assertDatabaseMissing('sessions', ['id' => 'existing-session']);
        $this->actingAs($operator)->patch("/super-admin/users/{$operator->id}/status", [
            'status' => 'suspended', 'reason' => 'Cannot suspend', 'confirmed' => true,
        ])->assertSessionHasErrors('status');
        $this->assertNull($operator->fresh()->suspended_at);
    }

    public function test_audit_failure_rolls_back_status_and_credentials(): void
    {
        $operator = User::factory()->create(['is_super_admin' => true]);
        $user = User::factory()->create(['remember_token' => 'preserved']);
        $user->createToken('preserved');
        PlatformAuditLog::creating(fn () => throw new \RuntimeException('Audit unavailable'));
        try {
            app(PlatformAdministration::class)->setSuspended($user, true, $operator, 'Must roll back');
            $this->fail('Audit failure should abort the change.');
        } catch (\RuntimeException $exception) {
            $this->assertSame('Audit unavailable', $exception->getMessage());
        } finally {
            PlatformAuditLog::flushEventListeners();
        }
        $this->assertNull($user->fresh()->suspended_at);
        $this->assertSame('preserved', $user->fresh()->remember_token);
        $this->assertDatabaseCount('personal_access_tokens', 1);
        $this->assertDatabaseCount('platform_audit_logs', 0);
    }

    public function test_stock_api_enforces_product_shop_membership_role_and_suspension(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $shop = Shop::create(['name' => 'Stock', 'slug' => 'stock-api']);
        $product = Product::withoutEvents(fn () => Product::create(['shop_id' => $shop->id, 'name' => 'Private inventory', 'status' => 'active']));
        $variant = ProductVariant::create(['product_id' => $product->id, 'sku' => 'PRIVATE', 'price' => 10]);
        Inventory::create(['shop_id' => $shop->id, 'product_variant_id' => $variant->id, 'quantity' => 3, 'cost_price' => 5]);
        $url = '/api/admin/products/stocks/'.$product->id;
        $this->actingAs($user)->getJson($url)->assertForbidden();
        $shop->members()->attach($user, ['role' => 'cashier']);
        $this->getJson($url)->assertForbidden();
        $shop->members()->updateExistingPivot($user->id, ['role' => 'owner']);
        $this->getJson($url)->assertOk()->assertJsonCount(1);
        $shop->forceFill(['suspended_at' => now(), 'suspension_reason' => 'Secret reason'])->save();
        $this->getJson($url)->assertForbidden()->assertDontSee('Secret reason');
    }
}
