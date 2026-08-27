<?php

namespace App\Models;

use App\Models\Concerns\BelongsToShop;
use Illuminate\Database\Eloquent\Model;

class CashShift extends Model
{
    use BelongsToShop;
    protected $fillable = ['shop_id', 'user_id', 'opening_float', 'opened_at', 'closing_cash', 'expected_cash', 'variance', 'closed_at', 'notes'];
    protected $casts = ['opening_float' => 'decimal:2', 'closing_cash' => 'decimal:2', 'expected_cash' => 'decimal:2', 'variance' => 'decimal:2', 'opened_at' => 'datetime', 'closed_at' => 'datetime'];
    public function user() { return $this->belongsTo(User::class); }
}
