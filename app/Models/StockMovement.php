<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    protected $fillable = [
        'product_variant_id',
        'inventory_id',
        'type',
        'quantity',
        'reference_type',
        'reference_id',
        'note',
        'performed_by',
    ];

    protected $casts = [
        'quantity' => 'integer',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    public function inventory()
    {
        return $this->belongsTo(Inventory::class);
    }

    public function reference()
    {
        return $this->morphTo();
    }

    public function performedBy()
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeForVariant($query, int $variantId)
    {
        return $query->where('product_variant_id', $variantId);
    }
}
