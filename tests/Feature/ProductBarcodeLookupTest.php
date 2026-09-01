<?php

namespace Tests\Feature;

use App\Models\Shop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ProductBarcodeLookupTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_owner_can_lookup_and_normalize_a_catalog_product_from_a_barcode(): void
    {
        [$shop, $owner] = $this->shopAndOwner();

        Http::fake([
            'https://world.openfoodfacts.org/*' => Http::response([
                'product' => [
                    'product_name' => 'Chocolate Hazelnut Spread',
                    'generic_name' => 'Cocoa and hazelnut spread',
                    'brands' => 'Example Brand',
                    'image_front_url' => 'https://images.openfoodfacts.org/images/products/301/762/042/2003/front_en.1.400.jpg',
                ],
            ]),
        ]);

        $this->actingAs($owner)
            ->getJson("/{$shop->slug}/products/barcode-lookup/3017620422003")
            ->assertOk()
            ->assertJsonPath('found', true)
            ->assertJsonPath('barcode', '3017620422003')
            ->assertJsonPath('source', 'Open Food Facts')
            ->assertJsonPath('product.name', 'Chocolate Hazelnut Spread')
            ->assertJsonPath('product.description', 'Cocoa and hazelnut spread')
            ->assertJsonPath('product.brand', 'Example Brand')
            ->assertJsonPath('product.image', 'https://images.openfoodfacts.org/images/products/301/762/042/2003/front_en.1.400.jpg');

        Http::assertSent(fn ($request) => $request->url() === 'https://world.openfoodfacts.org/api/v3/product/3017620422003?product_type=all');
    }

    public function test_an_unknown_barcode_returns_a_clear_not_found_response(): void
    {
        [$shop, $owner] = $this->shopAndOwner();

        Http::fake([
            'https://world.openfoodfacts.org/*' => Http::response([], 404),
        ]);

        $this->actingAs($owner)
            ->getJson("/{$shop->slug}/products/barcode-lookup/3017620422003")
            ->assertNotFound()
            ->assertJsonPath('found', false)
            ->assertJsonPath('message', 'No catalog product was found for this barcode.');
    }

    public function test_a_barcode_must_be_between_eight_and_fourteen_digits(): void
    {
        [$shop, $owner] = $this->shopAndOwner();

        Http::fake();

        $this->actingAs($owner)
            ->getJson("/{$shop->slug}/products/barcode-lookup/12345")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('barcode');

        Http::assertNothingSent();
    }

    private function shopAndOwner(): array
    {
        $shop = Shop::create(['name' => 'Catalog Shop', 'slug' => 'catalog-shop']);
        $owner = User::factory()->create();
        $shop->members()->attach($owner->id, ['role' => 'owner']);

        return [$shop, $owner];
    }
}
