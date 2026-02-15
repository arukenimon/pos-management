<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $table = 'products';

    protected $fillable = [
        'name',
        'sku',
        // 'category_id',
        // 'price',
        // 'stock',
        'status',
        'description',
        'images',
    ];

    protected $casts = [
        'images' => 'array',
    ];

    public function variants()
    {
        return $this->hasMany(Variant::class, 'product_id', 'id');
    }

    public function stocks()
    {
        return $this->hasMany(Stock::class, 'product_id', 'id');
    }
    
    public function cartItems()
    {
        return $this->hasMany(Cart::class, 'product_id', 'id');
    }
}
