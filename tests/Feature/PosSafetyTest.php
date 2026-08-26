<?php

namespace Tests\Feature;

use App\Models\Inventory;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Shop;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PosSafetyTest extends TestCase
{
    use RefreshDatabase;

    public function test_cashier_can_complete_a_sale_and_stock_is_deducted(): void
    {
        [$shop, $cashier] = $this->shopWithMember('cashier');
        [$variant, $inventory] = $this->sellableVariant($shop, quantity: 5, price: 12.50);

        $response = $this->actingAs($cashier)->post("/{$shop->slug}/pos/checkout", [
            'items' => [['variant_id' => $variant->id, 'quantity' => 2]],
            'payment_method' => 'cash',
            'cash_received' => 30,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('orders', [
            'shop_id' => $shop->id,
            'cashier_id' => $cashier->id,
            'total' => 25,
            'payment_method' => 'cash',
            'cash_received' => 30,
            'change_given' => 5,
        ]);
        $this->assertSame(3, Inventory::withoutGlobalScopes()->findOrFail($inventory->id)->quantity);
        $this->assertDatabaseHas('stock_movements', [
            'shop_id' => $shop->id,
            'product_variant_id' => $variant->id,
            'type' => 'sale',
            'quantity' => -2,
        ]);
    }

    public function test_checkout_rejects_insufficient_stock_without_creating_a_sale(): void
    {
        [$shop, $cashier] = $this->shopWithMember('cashier');
        [$variant, $inventory] = $this->sellableVariant($shop, quantity: 2);

        $response = $this->actingAs($cashier)->post("/{$shop->slug}/pos/checkout", [
            'items' => [['variant_id' => $variant->id, 'quantity' => 3]],
            'payment_method' => 'card',
        ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors('items');
        $this->assertSame(0, Order::withoutGlobalScopes()->count());
        $this->assertSame(2, Inventory::withoutGlobalScopes()->findOrFail($inventory->id)->quantity);
        $this->assertSame(0, StockMovement::withoutGlobalScopes()->count());
    }

    public function test_checkout_rejects_cash_that_does_not_cover_the_total(): void
    {
        [$shop, $cashier] = $this->shopWithMember('cashier');
        [$variant, $inventory] = $this->sellableVariant($shop, quantity: 3, price: 20);

        $response = $this->actingAs($cashier)->post("/{$shop->slug}/pos/checkout", [
            'items' => [['variant_id' => $variant->id, 'quantity' => 1]],
            'payment_method' => 'cash',
            'cash_received' => 10,
        ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors('cash_received');
        $this->assertSame(0, Order::withoutGlobalScopes()->count());
        $this->assertSame(3, Inventory::withoutGlobalScopes()->findOrFail($inventory->id)->quantity);
    }

    public function test_a_shop_member_cannot_sell_another_shops_variant(): void
    {
        [$shopA, $cashier] = $this->shopWithMember('cashier', 'shop-a');
        $shopB = Shop::create(['name' => 'Shop B', 'slug' => 'shop-b']);
        [$foreignVariant, $foreignInventory] = $this->sellableVariant($shopB, quantity: 4);

        $response = $this->actingAs($cashier)->post("/{$shopA->slug}/pos/checkout", [
            'items' => [['variant_id' => $foreignVariant->id, 'quantity' => 1]],
            'payment_method' => 'card',
        ]);

        $response->assertNotFound();
        $this->assertSame(0, Order::withoutGlobalScopes()->count());
        $this->assertSame(4, Inventory::withoutGlobalScopes()->findOrFail($foreignInventory->id)->quantity);
    }

    public function test_an_owner_cannot_add_stock_to_another_shops_variant(): void
    {
        [$shopA, $owner] = $this->shopWithMember('owner', 'stock-shop-a');
        $shopB = Shop::create(['name' => 'Stock Shop B', 'slug' => 'stock-shop-b']);
        [$foreignVariant, $foreignInventory] = $this->sellableVariant($shopB, quantity: 4);

        $response = $this->actingAs($owner)->post("/{$shopA->slug}/products/add-stock/{$foreignVariant->id}", [
            'quantity' => 10,
            'cost_price' => 8,
        ]);

        $response->assertNotFound();
        $this->assertSame(4, Inventory::withoutGlobalScopes()->findOrFail($foreignInventory->id)->quantity);
        $this->assertSame(1, Inventory::withoutGlobalScopes()->count());
    }

    public function test_a_shop_manager_cannot_open_owner_only_settings_but_an_owner_can(): void
    {
        $shop = Shop::create(['name' => 'Role Shop', 'slug' => 'role-shop']);
        $owner = User::factory()->create();
        $manager = User::factory()->create();
        $cashier = User::factory()->create();
        $shop->members()->attach($owner->id, ['role' => 'owner']);
        $shop->members()->attach($manager->id, ['role' => 'manager']);
        $shop->members()->attach($cashier->id, ['role' => 'cashier']);

        $this->actingAs($manager)->get("/{$shop->slug}/settings")->assertForbidden();
        $this->actingAs($cashier)->get("/{$shop->slug}/settings/team")->assertForbidden();
        $this->actingAs($owner)->get("/{$shop->slug}/settings")->assertOk();
    }

    public function test_manager_can_refund_a_completed_sale_once_and_stock_is_restored(): void
    {
        [$shop, $cashier] = $this->shopWithMember('cashier', 'refund-shop');
        $manager = User::factory()->create();
        $shop->members()->attach($manager->id, ['role' => 'manager']);
        [$variant, $inventory] = $this->sellableVariant($shop, quantity: 5);

        $this->actingAs($cashier)->post("/{$shop->slug}/pos/checkout", [
            'items' => [['variant_id' => $variant->id, 'quantity' => 2]],
            'payment_method' => 'card',
        ])->assertRedirect();
        $order = Order::withoutGlobalScopes()->firstOrFail();

        $this->actingAs($manager)->post("/{$shop->slug}/sales/{$order->id}/refund", ['reason' => 'Customer return'])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'refunded', 'correction_reason' => 'Customer return']);
        $this->assertSame(5, Inventory::withoutGlobalScopes()->findOrFail($inventory->id)->quantity);
        $this->assertDatabaseHas('stock_movements', ['reference_id' => $order->id, 'type' => 'adjustment', 'quantity' => 2]);

        $this->actingAs($manager)->post("/{$shop->slug}/sales/{$order->id}/refund")
            ->assertStatus(422);
        $this->assertSame(5, Inventory::withoutGlobalScopes()->findOrFail($inventory->id)->quantity);
    }

    private function shopWithMember(string $role, string $slug = 'test-shop'): array
    {
        $shop = Shop::create(['name' => 'Test Shop', 'slug' => $slug]);
        $user = User::factory()->create();
        $shop->members()->attach($user->id, ['role' => $role]);

        return [$shop, $user];
    }

    private function sellableVariant(Shop $shop, int $quantity, float $price = 10): array
    {
        $product = Product::withoutGlobalScopes()->create([
            'shop_id' => $shop->id,
            'name' => 'Test product',
            'status' => 'active',
            'images' => [],
        ]);
        $variant = ProductVariant::withoutGlobalScopes()->create([
            'product_id' => $product->id,
            'sku' => "SKU-{$shop->id}-{$product->id}",
            'price' => $price,
        ]);
        $inventory = Inventory::withoutGlobalScopes()->create([
            'shop_id' => $shop->id,
            'product_variant_id' => $variant->id,
            'quantity' => $quantity,
            'cost_price' => 5,
        ]);

        return [$variant, $inventory];
    }
}
