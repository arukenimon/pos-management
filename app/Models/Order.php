<?php

namespace App\Models;

use App\Models\Concerns\BelongsToShop;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use BelongsToShop;

    protected static function booted(): void
    {
        // Announce each completed sale to the shop's members (skip the cashier
        // who rang it up). Fires once per order, not per line item.
        static::created(function (Order $order): void {
            $order->notifyShopMembers(
                kind: 'sale',
                title: 'New sale',
                message: '₱' . number_format((float) $order->total, 2) . ' • ' . $order->payment_method,
                exceptUserId: $order->cashier_id,
                meta: ['order_id' => $order->id],
            );
        });
    }

    protected $fillable = [
        'shop_id',
        'cashier_id',
        'total',
        'payment_method',
        'cash_received',
        'change_given',
    ];

    protected $casts = [
        'total'         => 'decimal:2',
        'cash_received' => 'decimal:2',
        'change_given'  => 'decimal:2',
    ];

    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
