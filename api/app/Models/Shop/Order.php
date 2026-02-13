<?php

namespace App\Models\Shop;

use App\Enums\Shop\OrderStatusEnum;
use App\Models\BaseModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\QueryBuilder\AllowedFilter;

class Order extends BaseModel
{
    /** Generate next order number for current year (e.g. TAP-2026-00001). Call within a DB transaction. */
    public static function generateOrderNumber(): string
    {
        $year = date('Y');
        $prefix = "TAP-{$year}-";

        $last = self::query()
            ->where('order_number', 'like', $prefix.'%')
            ->orderByRaw('CAST(SUBSTRING(order_number, 10) AS UNSIGNED) DESC')
            ->lockForUpdate()
            ->first();

        $next = $last ? (int) substr($last->order_number, 10) + 1 : 1;

        return $prefix.str_pad((string) $next, 5, '0', STR_PAD_LEFT);
    }

    protected $table = 'shop_orders';

    protected $fillable = [
        'user_id',
        'order_number',
        'status',
        'subtotal',
        'shipping_amount',
        'discount_amount',
        'total',
        'currency',
        'address',
        'city',
        'country',
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
            'total' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    /** Scope: filter orders by customer phone (matches user.phone by digits). */
    public function scopePhone(Builder $query, ?string $value): void
    {
        if ($value === null || $value === '') {
            return;
        }
        $userIds = User::query()->select('id')->phone($value)->pluck('id');
        if ($userIds->isEmpty()) {
            $query->whereRaw('1 = 0');

            return;
        }
        $query->whereIn('user_id', $userIds);
    }

    /**
     * @return array<int, string|AllowedFilter>
     */
    public static function getFilters(): array
    {
        return ['id', 'user_id', 'status', 'order_number', AllowedFilter::scope('phone')];
    }

    /**
     * @return array<int, string>
     */
    public static function getSorts(): array
    {
        return ['id', 'order_number', 'total', 'status', 'created_at', 'updated_at'];
    }
}
