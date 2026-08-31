<?php

namespace App\Models\Shop;

use App\Enums\Shop\ProductDiscountTypeEnum;
use App\Enums\Shop\VendorStatusEnum;
use App\Models\BaseModel;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;
use Spatie\QueryBuilder\AllowedFilter;

class Product extends BaseModel
{
    protected $table = 'shop_products';

    protected $fillable = [
        'vendor_id',
        'name',
        'slug',
        'description',
        'sku',
        'price',
        'brand_id',
        'category_id',
        'stock_quantity',
        'low_stock_threshold',
        'is_active',
        'is_featured',
        'is_popular',
        'is_special_offer',
        'discount_type',
        'discount_value',
        'discount_starts_at',
        'discount_ends_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'is_popular' => 'boolean',
            'is_special_offer' => 'boolean',
            'discount_type' => ProductDiscountTypeEnum::class,
            'discount_value' => 'decimal:2',
            'discount_starts_at' => 'datetime',
            'discount_ends_at' => 'datetime',
        ];
    }

    /** Whether the product has an active discount (within date range if set). */
    public function hasValidDiscount(): bool
    {
        if ($this->discount_type === null || $this->discount_value === null) {
            return false;
        }
        $now = Carbon::now();
        if ($this->discount_starts_at !== null && $now->lt($this->discount_starts_at)) {
            return false;
        }
        if ($this->discount_ends_at !== null && $now->gt($this->discount_ends_at)) {
            return false;
        }

        return true;
    }

    /** Sale price after discount, or null if no valid discount. */
    public function getSalePrice(): ?float
    {
        if (! $this->hasValidDiscount()) {
            return null;
        }
        $price = (float) $this->price;
        $value = (float) $this->discount_value;
        if ($this->discount_type === ProductDiscountTypeEnum::PERCENTAGE) {
            return round($price * (1 - $value / 100), 2);
        }

        return round(max(0, $price - $value), 2);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class, 'brand_id');
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class, 'vendor_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class, 'product_id')->orderBy('sort_order');
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class, 'product_id');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'product_id');
    }

    public function scopeForVendor(Builder $query, int $vendorId): void
    {
        $query->where('vendor_id', $vendorId);
    }

    /**
     * Buyer-visible / checkout-eligible catalog rows.
     */
    public function scopeSellable(Builder $query): void
    {
        $query->where('is_active', true)
            ->whereHas('vendor', fn (Builder $q) => $q->where('status', VendorStatusEnum::APPROVED));
    }

    public function isSellable(): bool
    {
        if (! $this->is_active) {
            return false;
        }

        $vendor = $this->relationLoaded('vendor') ? $this->vendor : $this->vendor()->first();

        return $vendor !== null && $vendor->status === VendorStatusEnum::APPROVED;
    }

    /**
     * Generate SKU as BRANDCODE-CATEGORYCODE-NNN (e.g. TMSPORTS-BALL-001).
     * Uses brand and category slugs (uppercase, no dashes) and the next free sequence for that brand+category.
     *
     * Sequence is based on the highest existing numeric suffix, not row count, so deletes or imports
     * cannot reuse an SKU that is still taken (unique constraint on `sku`).
     */
    public static function generateIntelligentSku(int $brandId, int $categoryId): string
    {
        $brand = Brand::find($brandId);
        $category = Category::find($categoryId);
        $brandCode = $brand && $brand->slug
            ? strtoupper(str_replace('-', '', $brand->slug))
            : 'BRAND';
        $categoryCode = $category && $category->slug
            ? strtoupper(str_replace('-', '', $category->slug))
            : 'CAT';
        $prefix = $brandCode.'-'.$categoryCode.'-';

        $maxSuffix = self::query()
            ->where('brand_id', $brandId)
            ->where('category_id', $categoryId)
            ->where('sku', 'like', $prefix.'%')
            ->pluck('sku')
            ->map(function (string $sku) use ($prefix): int {
                if (! str_starts_with($sku, $prefix)) {
                    return 0;
                }
                $suffix = substr($sku, strlen($prefix));

                return ctype_digit($suffix) ? (int) $suffix : 0;
            })
            ->max() ?? 0;

        $next = $maxSuffix + 1;
        $width = max(3, strlen((string) $next));

        return $prefix.str_pad((string) $next, $width, '0', STR_PAD_LEFT);
    }

    /** Free-search scope: case-insensitive match on name OR SKU. */
    public function scopeSearch(Builder $query, ?string $value): void
    {
        if ($value === null || $value === '') {
            return;
        }
        $term = '%'.addcslashes(mb_strtolower($value), '%_\\').'%';
        $query->where(function (Builder $q) use ($term): void {
            $q->whereRaw('LOWER(name) LIKE ?', [$term])
                ->orWhereRaw('LOWER(sku) LIKE ?', [$term]);
        });
    }

    /**
     * Scope: `in_stock` / `low_stock` / `out_of_stock`, using the same
     * stock_quantity vs. COALESCE(low_stock_threshold, 5) comparison already
     * used for the low-stock dashboard widget (see EcommerceDashboardController).
     */
    public function scopeStockStatus(Builder $query, ?string $value): void
    {
        match ($value) {
            'out_of_stock' => $query->where('stock_quantity', '<=', 0),
            'low_stock' => $query->where('stock_quantity', '>', 0)
                ->whereColumn('stock_quantity', '<=', DB::raw('COALESCE(low_stock_threshold, 5)')),
            'in_stock' => $query->whereColumn('stock_quantity', '>', DB::raw('COALESCE(low_stock_threshold, 5)')),
            default => null,
        };
    }

    /**
     * @return array<int, string>
     */
    public static function getFilters(): array
    {
        return [
            AllowedFilter::exact('id'),
            'name',
            AllowedFilter::scope('search'),
            AllowedFilter::scope('stock_status'),
            AllowedFilter::exact('brand_id'),
            AllowedFilter::exact('category_id'),
            AllowedFilter::exact('vendor_id'),
            AllowedFilter::exact('is_active'),
            AllowedFilter::exact('is_featured'),
            AllowedFilter::exact('is_popular'),
            AllowedFilter::exact('is_special_offer'),
            AllowedFilter::exact('discount_type'),
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function getSorts(): array
    {
        return ['id', 'name', 'slug', 'price', 'stock_quantity', 'created_at', 'updated_at'];
    }
}
