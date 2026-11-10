<?php

if (getenv('APP_ENV') !== 'testing' || ! getenv('PLATFORM_E2E_DIR')) {
    throw new RuntimeException('Platform fixtures require the isolated E2E runner.');
}

require __DIR__.'/../../vendor/autoload.php';
$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$operator = App\Models\User::factory()->create([
    'name' => 'Platform Operator', 'email' => 'platform@example.test', 'password' => 'PlatformTest123!',
]);
$owner = App\Models\User::factory()->create([
    'name' => 'Shop Owner', 'email' => 'shop-owner@example.test', 'password' => 'PlatformTest123!', 'role' => 'admin',
]);
app(App\Services\PlatformAdministration::class)->setSuperAdmin($operator, true, 'Isolated browser test operator');
foreach (['market-lane' => 'Market Lane', 'river-shop' => 'River Shop'] as $slug => $name) {
    $shop = App\Models\Shop::create(['name' => $name, 'slug' => $slug]);
    $shop->members()->attach($owner->id, ['role' => 'owner']);
}
for ($index = 1; $index <= 28; $index++) {
    App\Models\Shop::create(['name' => sprintf('Platform review %02d', $index), 'slug' => 'review-'.$index]);
}
