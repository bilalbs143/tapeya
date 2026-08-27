<?php

namespace App\Models\Shop;

use App\Enums\Shop\InventoryReasonEnum;
use App\Models\BaseModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class InventoryLog extends BaseModel
{
    protected $table = 'shop_inventory_logs';

    protected $fillable = [
        'product_id',
        'vendor_id',
        'delta',
        'quantity_after',
        'reason',
        'reference_type',
        'reference_id',
        'actor_user_id',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'delta' => 'integer',
            'quantity_after' => 'integer',
            'reason' => InventoryReasonEnum::class,
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class, 'vendor_id');
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }

    public function reference(): MorphTo
    {
        return $this->morphTo(__FUNCTION__, 'reference_type', 'reference_id');
    }
}
