<?php

namespace App\Models\Shop;

use App\Enums\Shop\OrderStatusEnum;
use App\Models\BaseModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VendorOrder extends BaseModel
{
    protected $table = 'shop_vendor_orders';

    protected $fillable = [
        'order_id',
        'vendor_id',
        'vendor_order_number',
        'status',
        'subtotal',
        'shipping_amount',
        'discount_amount',
        'commission_rate_snapshot',
        'commission_amount',
        'vendor_earnings',
        'total',
        'tracking_number',
        'carrier',
        'notes',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => OrderStatusEnum::class,
            'subtotal' => 'decimal:2',
            'shipping_amount' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'commission_rate_snapshot' => 'decimal:2',
            'commission_amount' => 'decimal:2',
            'vendor_earnings' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class, 'vendor_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'vendor_order_id');
    }
}
