<?php

namespace App\Models\Shop;

use App\Models\BaseModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends BaseModel
{
    protected $table = 'shop_order_items';

    protected $fillable = [
        'order_id',
        'vendor_id',
        'vendor_order_id',
        'product_id',
        'product_snapshot',
        'quantity',
        'unit_price',
        'total_price',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'product_snapshot' => 'array',
            'quantity' => 'integer',
            'unit_price' => 'decimal:2',
            'total_price' => 'decimal:2',
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

    public function vendorOrder(): BelongsTo
    {
        return $this->belongsTo(VendorOrder::class, 'vendor_order_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
