<?php

namespace App\Models;

use App\Models\Concerns\BelongsToShop;
use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    use BelongsToShop;

    protected static function booted(): void
    {
        // Notify shop members of every stock change. Fires for purchases,
        // sales, deletions and adjustments alike, since they all funnel
        // through create(). The member who performed the action is skipped.
        static::created(function (StockMovement $movement): void {
            // Sales are announced once per order (see Order model), not per
            // line-item movement — skip them here to avoid a toast per item.
            if (! $movement->shop_id || $movement->type === 'sale') {
                return;
            }

            $movement->loadMissing([
                'variant.product:id,name',
                'variant.attributeValues:id,value',
            ]);

            $label = $movement->variant?->attributeValues?->isNotEmpty()
                ? $movement->variant->attributeValues->map(fn ($av) => $av->value)->join(' / ')
                : $movement->variant?->sku;
            $name = trim(($movement->variant?->product?->name ?? 'Item') . ($label ? " — {$label}" : ''));
            $sign = $movement->quantity > 0 ? '+' : '';

            $movement->notifyShopMembers(
                kind: 'stock',
                title: 'Stock ' . $movement->type,
                message: "{$name} ({$sign}{$movement->quantity})",
                exceptUserId: $movement->performed_by,
                meta: ['movement_id' => $movement->id],
            );
        });
    }

    protected $fillable = [
        'shop_id',
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
