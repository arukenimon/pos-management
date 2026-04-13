<?php

namespace App\Models;

use App\Models\Concerns\BelongsToShop;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use BelongsToShop;

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
