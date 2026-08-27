<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_shifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('opening_float', 10, 2);
            $table->timestamp('opened_at');
            $table->decimal('closing_cash', 10, 2)->nullable();
            $table->decimal('expected_cash', 10, 2)->nullable();
            $table->decimal('variance', 10, 2)->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->string('notes', 500)->nullable();
            $table->timestamps();
            $table->index(['shop_id', 'user_id', 'closed_at']);
        });
    }
    public function down(): void { Schema::dropIfExists('cash_shifts'); }
};
