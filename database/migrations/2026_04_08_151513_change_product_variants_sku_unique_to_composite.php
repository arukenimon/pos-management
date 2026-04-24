<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $indexes = Schema::getIndexes('product_variants');
        $hasUnique = fn (array $columns): bool => collect($indexes)->contains(
            fn (array $index) => ($index['unique'] ?? false) && ($index['columns'] ?? []) === $columns
        );

        if ($hasUnique(['product_id', 'sku'])) {
            return;
        }

        Schema::table('product_variants', function (Blueprint $table) {
            if (collect(Schema::getIndexes('product_variants'))->contains(fn (array $index) => ($index['unique'] ?? false) && ($index['columns'] ?? []) === ['sku'])) {
                $table->dropUnique(['sku']);
            }

            $table->unique(['product_id', 'sku']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $indexes = Schema::getIndexes('product_variants');
        $hasUnique = fn (array $columns): bool => collect($indexes)->contains(
            fn (array $index) => ($index['unique'] ?? false) && ($index['columns'] ?? []) === $columns
        );

        if ($hasUnique(['sku'])) {
            return;
        }

        Schema::table('product_variants', function (Blueprint $table) {
            if (collect(Schema::getIndexes('product_variants'))->contains(fn (array $index) => ($index['unique'] ?? false) && ($index['columns'] ?? []) === ['product_id', 'sku'])) {
                $table->dropUnique(['product_id', 'sku']);
            }

            $table->unique('sku');
        });
    }
};
