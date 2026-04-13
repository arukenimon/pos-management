<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Shop extends Model
{
    protected $fillable = ['name', 'slug', 'description'];

    protected static function booted(): void
    {
        static::creating(function (Shop $shop) {
            if (empty($shop->slug)) {
                $shop->slug = Str::slug($shop->name);
            }
        });
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'shop_user')
                    ->withPivot('role')
                    ->withTimestamps();
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** Resolve the shop from a slug, or abort 404. */
    public static function findBySlugOrFail(string $slug): self
    {
        return static::where('slug', $slug)->firstOrFail();
    }

    /** Check if a user belongs to this shop. */
    public function hasMember(User $user): bool
    {
        return $this->members()->where('user_id', $user->id)->exists();
    }

    /** Return the pivot role for a user, or null. */
    public function roleOf(User $user): ?string
    {
        $pivot = $this->members()->where('user_id', $user->id)->first()?->pivot;
        return $pivot?->role;
    }
}
