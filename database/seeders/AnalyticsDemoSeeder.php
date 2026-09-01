<?php

namespace Database\Seeders;

use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Shop;
use App\Models\StockMovement;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AnalyticsDemoSeeder extends Seeder
{
    use WithoutModelEvents;

    private const DEMO_MARKER = 'TindaHub showcase demo data';
    private const DAYS_BACK  = 365;
    private const TOTAL_ORDERS = 600;

    public function run(): void
    {
        $shopSlug = (string) env('ANALYTICS_DEMO_SHOP_SLUG');
        if ($shopSlug === '') {
            throw new \RuntimeException(
                'Set ANALYTICS_DEMO_SHOP_SLUG before running the analytics demo seeder.'
            );
        }

        $shop = Shop::where('slug', $shopSlug)->firstOrFail();
        app()->instance('current_shop', $shop);

        if (Product::withoutGlobalScope('shop')
            ->where('shop_id', $shop->id)
            ->where('description', 'like', '%' . self::DEMO_MARKER . '%')
            ->exists()) {
            $this->command->warn(
                "Showcase demo data already exists for shop '{$shop->slug}'; no changes were made."
            );
            return;
        }

        $cashierIds = $shop->members()->pluck('users.id')->all();
        if (empty($cashierIds)) {
            $this->command->error("Shop {$shop->slug} has no members; cannot pick a cashier.");
            return;
        }

        DB::transaction(function () use ($shop, $cashierIds) {
            [$variants, $variantCost] = $this->seedCatalog($shop);
            $this->seedSalesHistory($variants, $variantCost, $cashierIds);
        });

        $this->command->info("Analytics demo data seeded for shop '{$shop->slug}'.");
    }

    /**
     * Create products + variants + inventories + initial stock-in movements.
     *
     * @return array{0: array<int, ProductVariant>, 1: array<int, float>}
     */
    private function seedCatalog(Shop $shop): array
    {
        $sizeAttr   = Attribute::withoutGlobalScope('shop')->firstOrCreate(['shop_id' => $shop->id, 'name' => 'Size']);
        $flavorAttr = Attribute::withoutGlobalScope('shop')->firstOrCreate(['shop_id' => $shop->id, 'name' => 'Flavor']);

        $sizeValues = collect(['Small', 'Medium', 'Large'])->mapWithKeys(
            fn ($v) => [$v => AttributeValue::firstOrCreate(['attribute_id' => $sizeAttr->id, 'value' => $v])]
        );
        $flavorValues = collect(['Original', 'Strawberry', 'Chocolate', 'Vanilla'])->mapWithKeys(
            fn ($v) => [$v => AttributeValue::firstOrCreate(['attribute_id' => $flavorAttr->id, 'value' => $v])]
        );

        $catalog = [
            ['name' => 'Bottled Water',  'price' => 25,  'cost' => 12, 'variants' => [['Small'], ['Medium'], ['Large']]],
            ['name' => 'Iced Coffee',    'price' => 85,  'cost' => 40, 'variants' => [['Small'], ['Medium'], ['Large']]],
            ['name' => 'Milk Tea',       'price' => 95,  'cost' => 45, 'variants' => [['Original', 'Medium'], ['Strawberry', 'Medium'], ['Chocolate', 'Large']]],
            ['name' => 'Chips',          'price' => 35,  'cost' => 18, 'variants' => [[]]],
            ['name' => 'Chocolate Bar',  'price' => 50,  'cost' => 25, 'variants' => [[]]],
            ['name' => 'Sandwich',       'price' => 75,  'cost' => 38, 'variants' => [[]]],
            ['name' => 'Energy Drink',   'price' => 65,  'cost' => 30, 'variants' => [['Small'], ['Large']]],
            ['name' => 'Ice Cream',      'price' => 55,  'cost' => 28, 'variants' => [['Vanilla'], ['Chocolate'], ['Strawberry']]],
        ];

        $variants    = [];
        $variantCost = [];

        foreach ($catalog as $p) {
            $product = Product::withoutGlobalScope('shop')->firstOrCreate(
                ['shop_id' => $shop->id, 'name' => $p['name']],
                [
                    'description' => $p['name'] . ' — ' . self::DEMO_MARKER,
                    'status'      => 'active',
                    'images'      => [],
                ]
            );

            foreach ($p['variants'] as $i => $attrCombo) {
                $sku = strtoupper(substr(preg_replace('/\s+/', '', $p['name']), 0, 6)) . '-' . ($i + 1);

                $variant = ProductVariant::firstOrCreate(
                    ['product_id' => $product->id, 'sku' => $sku],
                    ['price' => $p['price'] + $i * 5]
                );

                foreach ($attrCombo as $attrValueName) {
                    $av = $sizeValues->get($attrValueName) ?? $flavorValues->get($attrValueName);
                    if (! $av) continue;

                    $exists = DB::table('variant_attribute_values')
                        ->where('product_variant_id', $variant->id)
                        ->where('attribute_value_id', $av->id)
                        ->exists();
                    if (! $exists) {
                        DB::table('variant_attribute_values')->insert([
                            'product_variant_id' => $variant->id,
                            'attribute_value_id' => $av->id,
                        ]);
                    }
                }

                $cost       = (float) $p['cost'];
                $stockStart = Carbon::now()->subDays(self::DAYS_BACK + 5);

                $inventory = Inventory::withoutGlobalScope('shop')
                    ->where('shop_id', $shop->id)
                    ->where('product_variant_id', $variant->id)
                    ->first();

                if (! $inventory) {
                    $inventory = new Inventory([
                        'shop_id'            => $shop->id,
                        'product_variant_id' => $variant->id,
                        'quantity'           => 1000,
                        'cost_price'         => $cost,
                    ]);
                    $inventory->shop_id    = $shop->id;
                    $inventory->created_at = $stockStart;
                    $inventory->updated_at = $stockStart;
                    $inventory->save();

                    $movement = new StockMovement([
                        'shop_id'            => $shop->id,
                        'product_variant_id' => $variant->id,
                        'inventory_id'       => $inventory->id,
                        'type'               => 'purchase',
                        'quantity'           => 1000,
                        'note'               => 'Initial stock-in (demo)',
                    ]);
                    $movement->shop_id    = $shop->id;
                    $movement->created_at = $stockStart;
                    $movement->updated_at = $stockStart;
                    $movement->save();
                }

                $variants[$variant->id]    = $variant;
                $variantCost[$variant->id] = $cost;
            }
        }

        return [$variants, $variantCost];
    }

    /**
     * Generate orders spread across the time range, with order_items + sale stock movements.
     */
    private function seedSalesHistory(array $variants, array $variantCost, array $cashierIds): void
    {
        $shop       = app('current_shop');
        $variantIds = array_keys($variants);
        $now        = Carbon::now();
        $start      = $now->copy()->subDays(self::DAYS_BACK - 1)->startOfDay();

        for ($i = 0; $i < self::TOTAL_ORDERS; $i++) {
            $orderTime = $this->randomOrderTime($start, $now);

            $itemCount = random_int(1, 4);
            $pickedIds = (array) array_rand(array_flip($variantIds), min($itemCount, count($variantIds)));
            if (! is_array($pickedIds)) {
                $pickedIds = [$pickedIds];
            }

            $lines = [];
            $total = 0.0;

            foreach ($pickedIds as $variantId) {
                $variant   = $variants[$variantId];
                $qty       = random_int(1, 3);
                $unitPrice = (float) $variant->price;
                $subtotal  = round($unitPrice * $qty, 2);
                $total    += $subtotal;

                $lines[] = [
                    'variant_id' => $variantId,
                    'quantity'   => $qty,
                    'unit_price' => $unitPrice,
                    'subtotal'   => $subtotal,
                    'cost_price' => $variantCost[$variantId],
                ];
            }

            $paymentMethod = random_int(1, 100) <= 65 ? 'cash' : 'card';
            $cashReceived  = $paymentMethod === 'cash' ? ceil($total / 50) * 50 : null;

            $order = new Order([
                'shop_id'        => $shop->id,
                'cashier_id'     => $cashierIds[array_rand($cashierIds)],
                'total'          => $total,
                'payment_method' => $paymentMethod,
                'cash_received'  => $cashReceived,
                'change_given'   => $cashReceived !== null ? $cashReceived - $total : null,
            ]);
            $order->shop_id    = $shop->id;
            $order->created_at = $orderTime;
            $order->updated_at = $orderTime;
            $order->save();

            foreach ($lines as $line) {
                $item = new OrderItem([
                    'order_id'           => $order->id,
                    'product_variant_id' => $line['variant_id'],
                    'quantity'           => $line['quantity'],
                    'unit_price'         => $line['unit_price'],
                    'subtotal'           => $line['subtotal'],
                    'cost_price'         => $line['cost_price'],
                ]);
                $item->created_at = $orderTime;
                $item->updated_at = $orderTime;
                $item->save();

                $inventory = Inventory::withoutGlobalScope('shop')
                    ->where('shop_id', $shop->id)
                    ->where('product_variant_id', $line['variant_id'])
                    ->first();
                if ($inventory) {
                    $inventory->decrement('quantity', $line['quantity']);

                    $mv = new StockMovement([
                        'shop_id'            => $shop->id,
                        'product_variant_id' => $line['variant_id'],
                        'inventory_id'       => $inventory->id,
                        'type'               => 'sale',
                        'quantity'           => -$line['quantity'],
                        'reference_type'     => Order::class,
                        'reference_id'       => $order->id,
                        'performed_by'       => $order->cashier_id,
                    ]);
                    $mv->shop_id    = $shop->id;
                    $mv->created_at = $orderTime;
                    $mv->updated_at = $orderTime;
                    $mv->save();
                }
            }
        }
    }

    /**
     * Pick a random timestamp weighted toward business hours (8am-9pm).
     */
    private function randomOrderTime(Carbon $start, Carbon $end): Carbon
    {
        $day = $start->copy()->addSeconds(random_int(0, (int) abs($start->diffInSeconds($end))));

        $hour = $this->weightedHour();
        return $day->setTime($hour, random_int(0, 59), random_int(0, 59));
    }

    private function weightedHour(): int
    {
        $weights = [
            6 => 1, 7 => 2, 8 => 4, 9 => 5, 10 => 6, 11 => 8,
            12 => 10, 13 => 8, 14 => 5, 15 => 4, 16 => 5,
            17 => 7, 18 => 9, 19 => 8, 20 => 5, 21 => 3, 22 => 1,
        ];

        $sum  = array_sum($weights);
        $roll = random_int(1, $sum);
        $acc  = 0;
        foreach ($weights as $hour => $w) {
            $acc += $w;
            if ($roll <= $acc) return $hour;
        }
        return 12;
    }
}
