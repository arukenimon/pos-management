<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

use App\Models\Shop;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

// Boot Laravel
$app->boot();

// Find the shop
$shop = Shop::where('slug', 'default')->first();
echo "Shop: " . ($shop ? "id={$shop->id} name={$shop->name}" : "NOT FOUND") . PHP_EOL;

if (!$shop) exit(1);

// Bind current_shop
app()->instance('current_shop', $shop);

// Raw DB check - what shop_id does order 19 have?
$raw = DB::table('orders')->where('id', 19)->first();
echo "Order 19 raw shop_id: " . ($raw ? $raw->shop_id : "ORDER NOT FOUND IN DB") . PHP_EOL;
echo "Shop id: {$shop->id}" . PHP_EOL;
echo "Match: " . ($raw && $raw->shop_id == $shop->id ? "YES - should work" : "NO - mismatch!") . PHP_EOL;

// Try with scope
$order = Order::find(19);
echo "Order::find(19) with scope: " . ($order ? "FOUND (id={$order->id})" : "NOT FOUND") . PHP_EOL;

// Show all orders and their shop_ids
echo PHP_EOL . "All orders in DB:" . PHP_EOL;
$allOrders = DB::table('orders')->orderBy('id')->get(['id', 'shop_id']);
foreach ($allOrders as $o) {
    echo "  id={$o->id} shop_id={$o->shop_id}" . PHP_EOL;
}
