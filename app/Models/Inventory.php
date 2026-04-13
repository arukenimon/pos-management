<?php

namespace App\Models;

use App\Models\Concerns\BelongsToShop;
use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    use BelongsToShop;

    protected $fillable = [
        'shop_id',
        'product_variant_id',
        'quantity',
        'cost_price',
        'selling_price',
    ];

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }
}
