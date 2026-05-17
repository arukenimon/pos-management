<?php

namespace App\Models;

use App\Models\Concerns\BelongsToShop;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use BelongsToShop;

    protected $table = 'products';

    protected $fillable = [
        'shop_id',
        'name',
        'status',
        'description',
        'images',
    ];

    protected $casts = [
        'images' => 'array',
    ];

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }
}
