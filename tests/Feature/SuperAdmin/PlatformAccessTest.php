<?php

namespace Tests\Feature\SuperAdmin;

use App\Models\Shop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PlatformAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_platform_requires_authentication_verified_email_and_explicit_privilege(): void
    {
        $this->get('/super-admin')->assertRedirect('/login');
        $unverified = User::factory()->unverified()->create(['is_super_admin' => true]);
        $this->actingAs($unverified)->get('/super-admin')->assertRedirect('/verify-email');
        $shop = Shop::create(['name' => 'Access shop', 'slug' => 'access-shop']);
        foreach (['owner', 'manager', 'cashier'] as $role) {
            $user = User::factory()->create(['role' => 'admin']);
            $shop->members()->attach($user, ['role' => $role]);
            foreach (['/super-admin', '/super-admin/shops', '/super-admin/users', '/super-admin/audit-log'] as $path) {
                $this->actingAs($user)->get($path)->assertForbidden();
            }
            $this->actingAs($user)->patch("/super-admin/shops/{$shop->id}/status", [
                'status' => 'suspended', 'reason' => 'Unauthorized action', 'confirmed' => true,
            ])->assertForbidden();
        }
    }

    public function test_super_admin_has_platform_navigation_but_no_automatic_shop_access(): void
    {
        $operator = User::factory()->create(['is_super_admin' => true]);
        $shop = Shop::create(['name' => 'Private shop', 'slug' => 'private-shop']);
        $this->actingAs($operator)->get('/dashboard')->assertRedirect('/super-admin');
        $this->get('/super-admin')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('SuperAdmin/Overview')->where('auth.isSuperAdmin', true)->where('currentShop', null)->where('notifications', []));
        $this->get('/profile')->assertOk()->assertInertia(fn (Assert $page) => $page->where('currentShop', null));
        $this->get('/private-shop')->assertForbidden();
        $shop->members()->attach($operator, ['role' => 'cashier']);
        $this->get('/private-shop/settings')->assertForbidden();
        $this->get('/private-shop/pos')->assertOk();
        $this->delete('/profile', ['password' => 'password'])->assertForbidden();
        $this->assertDatabaseHas('users', ['id' => $operator->id]);
    }

    public function test_public_registration_and_profile_cannot_assign_platform_privilege_or_suspension(): void
    {
        $this->post('/register', [
            'name' => 'Shop Owner', 'shop_name' => 'Super Admin', 'email' => 'owner@example.test',
            'password' => 'password', 'password_confirmation' => 'password',
            'is_super_admin' => true, 'suspended_at' => now()->toDateTimeString(), 'suspension_reason' => 'Injected',
        ])->assertRedirect('/verify-email');
        $user = User::where('email', 'owner@example.test')->firstOrFail();
        $this->assertFalse($user->is_super_admin);
        $this->assertNull($user->suspended_at);
        $this->assertDatabaseHas('shops', ['slug' => 'super-admin-shop']);
        $user->forceFill(['email_verified_at' => now()])->save();
        $this->actingAs($user)->patch('/profile', [
            'name' => 'Owner Updated', 'email' => $user->email, 'is_super_admin' => true,
            'suspended_at' => now()->toDateTimeString(),
        ])->assertSessionHasNoErrors();
        $this->assertFalse($user->fresh()->is_super_admin);
        $this->assertNull($user->fresh()->suspended_at);
    }

    public function test_status_changes_require_confirmation_and_an_internal_reason(): void
    {
        $operator = User::factory()->create(['is_super_admin' => true]);
        $shop = Shop::create(['name' => 'Confirm', 'slug' => 'confirm-shop']);
        $this->actingAs($operator)->patch("/super-admin/shops/{$shop->id}/status", ['status' => 'suspended'])
            ->assertSessionHasErrors(['confirmed', 'reason']);
        $this->assertNull($shop->fresh()->suspended_at);
    }

    public function test_reserved_slug_preflight_fails_before_changing_the_schema(): void
    {
        Shop::create(['name' => 'Conflict', 'slug' => 'super-admin']);
        $migration = require database_path('migrations/2026_11_10_000000_add_platform_administration.php');
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Resolve this shop URL');
        $migration->up();
    }
}
