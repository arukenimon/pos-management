<?php

namespace Tests\Feature;

use App\Models\Inventory;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LowStockAlertTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_lists_active_variants_at_or_below_the_shop_threshold(): void
    {
        $shop = Shop::create([
            'name' => 'Alert Shop',
            'slug' => 'alert-shop',
            'low_stock_threshold' => 3,
        ]);
        $owner = User::factory()->create();
        $shop->members()->attach($owner->id, ['role' => 'owner']);

        $outOfStock = $this->variantWithStock($shop, 'Out of stock', 0);
        $lowStock = $this->variantWithStock($shop, 'Low stock', 3);
        $this->variantWithStock($shop, 'Well stocked', 4);

        $otherShop = Shop::create(['name' => 'Other Shop', 'slug' => 'other-shop']);
        $this->variantWithStock($otherShop, 'Other shop stock', 0);

        $this->actingAs($owner)
            ->get("/{$shop->slug}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Auth/Admin/AdminDashboard')
                ->where('lowStock.count', 2)
                ->where('lowStock.threshold', 3)
                ->where('lowStock.items.0.id', $outOfStock->id)
                ->where('lowStock.items.0.quantity', 0)
                ->where('lowStock.items.1.id', $lowStock->id)
                ->where('lowStock.items.1.quantity', 3)
            );
    }

    public function test_owner_can_change_the_low_stock_threshold(): void
    {
        $shop = Shop::create(['name' => 'Settings Shop', 'slug' => 'settings-shop']);
        $owner = User::factory()->create();
        $shop->members()->attach($owner->id, ['role' => 'owner']);

        $this->actingAs($owner)
            ->put("/{$shop->slug}/settings", [
                'name' => $shop->name,
                'description' => null,
                'currency' => 'PHP',
                'taxRate' => 0,
                'receiptFooter' => null,
                'paymentMethods' => ['cash'],
                'barcodeScanningEnabled' => true,
                'lowStockThreshold' => 12,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('shops', [
            'id' => $shop->id,
            'low_stock_threshold' => 12,
        ]);
    }

    private function variantWithStock(Shop $shop, string $name, int $quantity): ProductVariant
    {
        $product = Product::withoutGlobalScopes()->create([
            'shop_id' => $shop->id,
            'name' => $name,
            'status' => 'active',
            'images' => [],
        ]);

        $variant = ProductVariant::withoutGlobalScopes()->create([
            'product_id' => $product->id,
            'sku' => "SKU-{$product->id}",
            'price' => 10,
        ]);

        if ($quantity > 0) {
            Inventory::withoutGlobalScopes()->create([
                'shop_id' => $shop->id,
                'product_variant_id' => $variant->id,
                'quantity' => $quantity,
                'cost_price' => 5,
            ]);
        }

        return $variant;
    }
}
