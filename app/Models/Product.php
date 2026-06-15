<?php

namespace App\Models;

use App\Models\Concerns\BelongsToShop;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class Product extends Model
{
    use BelongsToShop;

    protected static function booted(): void
    {
        // Notify shop members when a new product is added (skip the creator).
        static::created(function (Product $product): void {
            $product->notifyShopMembers(
                kind: 'product',
                title: 'New product added',
                message: $product->name,
                exceptUserId: Auth::id(),
                meta: ['product_id' => $product->id],
            );
        });
    }

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
