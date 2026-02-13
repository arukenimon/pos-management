<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class products extends Model
{
    //

    protected $fillable = [
        'name',
        'sku',
        // 'category_id',
        // 'price',
        // 'stock',
        'status',
        // 'description',
        'images',
    ];

    protected $casts = [
        'images' => 'array',
    ];



    public function stocks()
    {
        return $this->hasMany(stocks::class, 'product_id', 'id');
    }
    public function cartItems()
    {
        return $this->hasMany(cart::class, 'product_id', 'id');
    }
}
