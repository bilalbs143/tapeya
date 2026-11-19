<?php

namespace App\Models;

use App\Enums\Ad\BrandPartnerStatusEnum;
use App\Models\Shop\Brand as ShopBrand;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\QueryBuilder\AllowedFilter;

class BrandPartner extends BaseModel
{
    protected $table = 'brand_partners';

    protected $fillable = [
        'name',
        'slug',
        'logo_path',
        'user_id',
        'shop_brand_id',
        'contact_email',
        'status',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => BrandPartnerStatusEnum::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function shopBrand(): BelongsTo
    {
        return $this->belongsTo(ShopBrand::class, 'shop_brand_id');
    }

    public function campaigns(): HasMany
    {
        return $this->hasMany(AdCampaign::class);
    }

    /**
     * @return array<int, string|AllowedFilter>
     */
    public static function getFilters(): array
    {
        return [
            AllowedFilter::exact('status'),
            AllowedFilter::exact('user_id'),
            AllowedFilter::partial('name'),
            AllowedFilter::partial('slug'),
            AllowedFilter::callback('search', function (Builder $query, mixed $value): void {
                $term = '%'.addcslashes(mb_strtolower((string) $value), '%_\\').'%';
                $query->where(function (Builder $q) use ($term) {
                    $q->whereRaw('LOWER(name) LIKE ?', [$term])
                        ->orWhereRaw('LOWER(slug) LIKE ?', [$term]);
                });
            }),
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function getSorts(): array
    {
        return [
            'id',
            'name',
            'slug',
            'status',
            'created_at',
            'updated_at',
        ];
    }
}
