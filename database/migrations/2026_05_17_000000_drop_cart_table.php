<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('cart');
    }

    public function down(): void
    {
        // The customer-facing storefront has been removed; the cart table is not
        // recreated on rollback. Restore from a prior migration if needed.
    }
};
