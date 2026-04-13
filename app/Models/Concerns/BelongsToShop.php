<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;

/**
 * Automatically scopes all Eloquent queries to the currently resolved shop.
 * Also auto-fills shop_id on new model instances.
 *
 * Usage: add `use BelongsToShop;` to any tenant model.
 */
trait BelongsToShop
{
    protected static function bootBelongsToShop(): void
    {
        // Global read scope
        static::addGlobalScope('shop', function (Builder $builder) {
            if (app()->bound('current_shop')) {
                $builder->where(
                    (new static())->getTable() . '.shop_id',
                    app('current_shop')->id
                );
            }
        });

        // Auto-fill shop_id on create
        static::creating(function ($model) {
            if (app()->bound('current_shop') && empty($model->shop_id)) {
                $model->shop_id = app('current_shop')->id;
            }
        });
    }

    public function shop()
    {
        return $this->belongsTo(\App\Models\Shop::class);
    }
}
