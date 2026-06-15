<?php

namespace App\Models\Concerns;

use App\Models\Shop;
use App\Notifications\ShopActivity;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Notification;

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

    /**
     * Send a ShopActivity notification to every member of this model's shop,
     * optionally skipping the user who triggered the action.
     */
    public function notifyShopMembers(string $kind, string $title, string $message, ?int $exceptUserId = null, array $meta = []): void
    {
        if (! $this->shop_id) {
            return;
        }

        $shop = Shop::find($this->shop_id);
        if (! $shop) {
            return;
        }

        $members = $shop->members()
            ->when($exceptUserId, fn ($q) => $q->where('users.id', '!=', $exceptUserId))
            ->get();

        if ($members->isNotEmpty()) {
            Notification::send($members, new ShopActivity($kind, $title, $message, $meta));
        }
    }
}
