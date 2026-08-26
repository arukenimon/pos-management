<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shops', function (Blueprint $table) {
            $table->string('currency', 3)->default('PHP');
            $table->decimal('tax_rate', 5, 2)->default(0);
            $table->string('receipt_footer')->nullable();
            $table->json('payment_methods')->nullable();
            $table->boolean('barcode_scanning_enabled')->default(true);
            $table->unsignedInteger('low_stock_threshold')->default(5);
        });
    }

    public function down(): void
    {
        Schema::table('shops', function (Blueprint $table) {
            $table->dropColumn([
                'currency',
                'tax_rate',
                'receipt_footer',
                'payment_methods',
                'barcode_scanning_enabled',
                'low_stock_threshold',
            ]);
        });
    }
};
