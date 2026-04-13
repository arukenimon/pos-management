<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $tables = ['products', 'orders', 'inventories', 'stock_movements', 'attributes'];

        foreach ($tables as $table) {
            if (!Schema::hasColumn($table, 'shop_id')) {
                Schema::table($table, function (Blueprint $table) {
                    $table->foreignId('shop_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
                });
            }
        }
    }

    public function down(): void
    {
        Schema::table('attributes', function (Blueprint $table) {
            $table->dropForeign(['shop_id']);
            $table->dropColumn('shop_id');
        });
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->dropForeign(['shop_id']);
            $table->dropColumn('shop_id');
        });
        Schema::table('inventories', function (Blueprint $table) {
            $table->dropForeign(['shop_id']);
            $table->dropColumn('shop_id');
        });
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['shop_id']);
            $table->dropColumn('shop_id');
        });
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['shop_id']);
            $table->dropColumn('shop_id');
        });
    }
};
