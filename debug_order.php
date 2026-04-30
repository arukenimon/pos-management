<?php

define('LARAVEL_START', microtime(true));

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

// Create a fake HTTP request to properly boot Laravel
$request = Illuminate\Http\Request::create('/default/sales/19', 'GET');
$request->setLaravelSession(
    $app->make(Illuminate\Session\Store::class, [
        'name'    => 'test',
        'handler' => new Illuminate\Session\NullSessionHandler(),
    ])
);

$app->instance('request', $request);
Illuminate\Support\Facades\Facade::clearResolvedInstances();

$app->make(Illuminate\Foundation\Bootstrap\RegisterFacades::class)->bootstrap($app);
$app->make(Illuminate\Foundation\Bootstrap\RegisterProviders::class)->bootstrap($app);
$app->make(Illuminate\Foundation\Bootstrap\BootProviders::class)->bootstrap($app);

use App\Models\Shop;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

// Find the shop by slug
$shop = Shop::where('slug', 'default')->first();
echo "Shop: " . ($shop ? "id={$shop->id} name={$shop->name}" : "NOT FOUND") . PHP_EOL;

if (!$shop) exit(1);

// Raw query - check order 19 directly in DB without any scopes
$raw = DB::table('orders')->where('id', 19)->first();
if ($raw) {
    echo "Order 19 raw: id={$raw->id} shop_id={$raw->shop_id}" . PHP_EOL;
    echo "Match: " . ($raw->shop_id == $shop->id ? "YES" : "NO - MISMATCH! order.shop_id={$raw->shop_id} vs shop.id={$shop->id}") . PHP_EOL;
} else {
    echo "Order 19: NOT IN DATABASE AT ALL" . PHP_EOL;
}

// Bind current_shop and try Eloquent
app()->instance('current_shop', $shop);
$order = Order::find(19);
echo "Order::find(19) with scope: " . ($order ? "FOUND" : "NOT FOUND (scope filtered it out)") . PHP_EOL;

// Show all shops
echo PHP_EOL . "All shops:" . PHP_EOL;
foreach (Shop::all() as $s) {
    echo "  id={$s->id} slug={$s->slug}" . PHP_EOL;
}

// Show all orders
echo PHP_EOL . "All orders:" . PHP_EOL;
foreach (DB::table('orders')->orderBy('id')->get(['id', 'shop_id']) as $o) {
    echo "  id={$o->id} shop_id={$o->shop_id}" . PHP_EOL;
}
