<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        // Create a default shop for all existing data
        $shopId = DB::table('shops')->insertGetId([
            'name'       => 'Default Shop',
            'slug'       => 'default',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Assign all existing data to the default shop
        DB::table('products')->update(['shop_id' => $shopId]);
        DB::table('orders')->update(['shop_id' => $shopId]);
        DB::table('inventories')->update(['shop_id' => $shopId]);
        DB::table('stock_movements')->update(['shop_id' => $shopId]);
        DB::table('attributes')->update(['shop_id' => $shopId]);

        // Migrate existing users to the shop with their corresponding roles
        // admin → owner, cashier → cashier, others → cashier
        $users = DB::table('users')->select('id', 'role')->get();

        foreach ($users as $user) {
            $shopRole = match ($user->role) {
                'admin'    => 'owner',
                'manager'  => 'manager',
                default    => 'cashier',
            };

            DB::table('shop_user')->insert([
                'shop_id'    => $shopId,
                'user_id'    => $user->id,
                'role'       => $shopRole,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('shop_user')->delete();
        DB::table('attributes')->update(['shop_id' => null]);
        DB::table('stock_movements')->update(['shop_id' => null]);
        DB::table('inventories')->update(['shop_id' => null]);
        DB::table('orders')->update(['shop_id' => null]);
        DB::table('products')->update(['shop_id' => null]);
        DB::table('shops')->where('slug', 'default')->delete();
    }
};
