<?php

namespace App\Models\Shop;

use App\Enums\Shop\VendorStatusEnum;
use App\Models\BaseModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\QueryBuilder\AllowedFilter;

class Vendor extends BaseModel
{
    protected $table = 'shop_vendors';

    protected $fillable = [
        'user_id',
        'store_name',
        'slug',
        'description',
        'logo',
        'banner',
        'phone',
        'email',
        'address',
        'city',
        'country',
        'status',
        'commission_rate',
        'default_shipping_amount',
        'is_platform',
        'approved_at',
        'suspended_at',
        'suspension_reason',
        'meta',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => VendorStatusEnum::class,
            'commission_rate' => 'decimal:2',
            'default_shipping_amount' => 'decimal:2',
            'is_platform' => 'boolean',
            'approved_at' => 'datetime',
            'suspended_at' => 'datetime',
            'meta' => 'array',
        ];
    }

    public static function house(): self
    {
        return self::query()
            ->where('is_platform', true)
            ->where('slug', config('shop.house_vendor_slug', 'tapeya-house'))
            ->firstOrFail();
    }

    public static function ensureHouse(): self
    {
        return self::query()->firstOrCreate(
            ['slug' => config('shop.house_vendor_slug', 'tapeya-house')],
            [
                'user_id' => null,
                'store_name' => config('shop.house_vendor_store_name', 'Tapeya'),
                'status' => VendorStatusEnum::APPROVED,
                'is_platform' => true,
                'approved_at' => now(),
            ]
        );
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'vendor_id');
    }

    public function vendorOrders(): HasMany
    {
        return $this->hasMany(VendorOrder::class, 'vendor_id');
    }

    public function isApproved(): bool
    {
        return $this->status === VendorStatusEnum::APPROVED;
    }

    public function resolvedCommissionRate(): float
    {
        if ($this->commission_rate !== null) {
            return (float) $this->commission_rate;
        }

        return (float) config('shop.default_commission_rate', 10);
    }

    /**
     * @return array<int, string|AllowedFilter>
     */
    public static function getFilters(): array
    {
        return [
            AllowedFilter::exact('id'),
            AllowedFilter::exact('user_id'),
            AllowedFilter::exact('status'),
            AllowedFilter::exact('is_platform'),
            'store_name',
            'slug',
            'city',
            'country',
            AllowedFilter::scope('search'),
        ];
    }

    /**
     * Free-search scope: store name/slug/own email/own phone, OR the owning account's
     * name/nickname/email/phone (delegates to {@see User::scopeSearch()}) —
     * support tickets usually start from the *person*, not the store name.
     */
    public function scopeSearch(Builder $query, ?string $value): void
    {
        if ($value === null || $value === '') {
            return;
        }
        $term = '%'.addcslashes(mb_strtolower($value), '%_\\').'%';
        $digits = preg_replace('/\D/', '', $value);
        $phoneLike = $digits !== '' ? '%'.$digits.'%' : null;
        $userIds = User::query()->select('id')->search($value)->pluck('id');

        $query->where(function (Builder $q) use ($term, $phoneLike, $userIds): void {
            $q->whereRaw('LOWER(store_name) LIKE ?', [$term])
                ->orWhereRaw('LOWER(slug) LIKE ?', [$term])
                ->orWhereRaw("LOWER(COALESCE(email, '')) LIKE ?", [$term]);
            if ($phoneLike !== null) {
                $q->orWhereRaw("REGEXP_REPLACE(COALESCE(phone, ''), '[^0-9]', '', 'g') LIKE ?", [$phoneLike]);
            }
            if ($userIds->isNotEmpty()) {
                $q->orWhereIn('user_id', $userIds);
            }
        });
    }

    /**
     * @return array<int, string>
     */
    public static function getSorts(): array
    {
        return ['id', 'store_name', 'slug', 'status', 'commission_rate', 'created_at', 'updated_at'];
    }
}
