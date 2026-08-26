<?php

namespace App\Models;

use App\Models\Concerns\BelongsToShopThroughProduct;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    use BelongsToShopThroughProduct;

    protected $fillable = [
        'product_id',
        'sku',
        'price',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function attributeValues()
    {
        return $this->belongsToMany(
            AttributeValue::class,
            'variant_attribute_values',
            'product_variant_id',
            'attribute_value_id'
        );
    }

    public function inventories()
    {
        return $this->hasMany(Inventory::class, 'product_variant_id');
    }
}
