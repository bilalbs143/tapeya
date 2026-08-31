<?php

namespace App\Models\Shop;

use App\Enums\Shop\OrderStatusEnum;
use App\Enums\Shop\PaymentMethodEnum;
use App\Enums\Shop\PaymentStatusEnum;
use App\Models\BaseModel;
use App\Models\User;
use App\Utils\Traits\Model\Filters\DateFilterTrait;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\QueryBuilder\AllowedFilter;

class Order extends BaseModel
{
    use DateFilterTrait;

    /** Generate next order number for current year (e.g. TAP-2026-00001). Call within a DB transaction. */
    public static function generateOrderNumber(): string
    {
        $year = date('Y');
        $prefix = "TAP-{$year}-";

        $last = self::query()
            ->where('order_number', 'like', $prefix.'%')
            ->orderByRaw('CAST(SUBSTRING(order_number FROM 10) AS INTEGER) DESC')
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
        'payment_status',
        'payment_method',
        'amount_received',
        'payment_verified_at',
        'payment_verified_by',
        'subtotal',
        'shipping_amount',
        'discount_amount',
        'total',
        'currency',
        'address',
        'city',
        'country',
        'notes',
        'placed_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => OrderStatusEnum::class,
            'payment_status' => PaymentStatusEnum::class,
            'payment_method' => PaymentMethodEnum::class,
            'amount_received' => 'decimal:2',
            'payment_verified_at' => 'datetime',
            'subtotal' => 'decimal:2',
            'shipping_amount' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'total' => 'decimal:2',
            'placed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id')->withTrashed();
    }

    public function paymentVerifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'payment_verified_by')->withTrashed();
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    public function vendorOrders(): HasMany
    {
        return $this->hasMany(VendorOrder::class, 'order_id');
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
     * Free-search scope: order number (partial) OR the owning customer's name/nickname/email/phone
     * (delegates to {@see User::scopeSearch()} — same reference matching this app's
     * other free-search scopes use).
     */
    public function scopeSearch(Builder $query, ?string $value): void
    {
        if ($value === null || $value === '') {
            return;
        }
        $term = '%'.addcslashes(mb_strtolower($value), '%_\\').'%';
        $userIds = User::query()->select('id')->search($value)->pluck('id');

        $query->where(function (Builder $q) use ($term, $userIds): void {
            $q->whereRaw('LOWER(order_number) LIKE ?', [$term]);
            if ($userIds->isNotEmpty()) {
                $q->orWhereIn('user_id', $userIds);
            }
        });
    }

    /**
     * @return array<int, string|AllowedFilter>
     */
    public static function getFilters(): array
    {
        return [
            'id',
            AllowedFilter::exact('user_id'),
            AllowedFilter::exact('status'),
            AllowedFilter::exact('payment_status'),
            'order_number',
            AllowedFilter::scope('phone'),
            AllowedFilter::scope('search'),
            AllowedFilter::scope('created_after'),
            AllowedFilter::scope('created_before'),
            AllowedFilter::scope('created_between'),
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function getSorts(): array
    {
        return ['id', 'order_number', 'total', 'status', 'created_at', 'updated_at'];
    }
}
