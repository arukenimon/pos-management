<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;

/**
 * Scopes records that belong to a product (such as variants) to the current
 * shop, even though the child table does not have its own shop_id column.
 */
trait BelongsToShopThroughProduct
{
    protected static function bootBelongsToShopThroughProduct(): void
    {
        static::addGlobalScope('product_shop', function (Builder $builder) {
            if (! app()->bound('current_shop')) {
                return;
            }

            $shopId = app('current_shop')->id;

            $builder->whereHas('product', function (Builder $query) use ($shopId) {
                $query->withoutGlobalScopes()->where('shop_id', $shopId);
            });
        });
    }
}
