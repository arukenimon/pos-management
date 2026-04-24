<?php

namespace App\Models;

use App\Models\Concerns\BelongsToShop;
use Illuminate\Database\Eloquent\Model;

class Attribute extends Model
{
    use BelongsToShop;

    protected $fillable = ['shop_id', 'name'];

    public function values()
    {
        return $this->hasMany(AttributeValue::class);
    }
}
