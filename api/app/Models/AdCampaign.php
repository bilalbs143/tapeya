<?php

namespace App\Models;

use App\Enums\Ad\AdCampaignObjectiveEnum;
use App\Enums\Ad\AdCampaignStatusEnum;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\QueryBuilder\AllowedFilter;

class AdCampaign extends BaseModel
{
    protected $table = 'ad_campaigns';

    protected $fillable = [
        'brand_partner_id',
        'name',
        'status',
        'objective',
        'starts_at',
        'ends_at',
        'priority',
        'surfaces',
        'slot_every_n',
        'max_ads_per_response',
        'targeting_json',
        'budget_notes',
        'created_by_admin_id',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => AdCampaignStatusEnum::class,
            'objective' => AdCampaignObjectiveEnum::class,
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'priority' => 'integer',
            'surfaces' => 'array',
            'slot_every_n' => 'integer',
            'max_ads_per_response' => 'integer',
            'targeting_json' => 'array',
        ];
    }

    public function brandPartner(): BelongsTo
    {
        return $this->belongsTo(BrandPartner::class);
    }

    public function creatives(): HasMany
    {
        return $this->hasMany(AdCreative::class, 'campaign_id');
    }

    public function createdByAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_admin_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(AdEvent::class, 'campaign_id');
    }

    public function statsDaily(): HasMany
    {
        return $this->hasMany(AdStatsDaily::class, 'campaign_id');
    }

    /**
     * @return array<int, string|AllowedFilter>
     */
    public static function getFilters(): array
    {
        return [
            AllowedFilter::exact('status'),
            AllowedFilter::exact('objective'),
            AllowedFilter::exact('brand_partner_id'),
            AllowedFilter::partial('name'),
            AllowedFilter::callback('search', function (Builder $query, mixed $value): void {
                $term = '%'.addcslashes(mb_strtolower((string) $value), '%_\\').'%';
                $query->whereRaw('LOWER(name) LIKE ?', [$term]);
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
            'status',
            'priority',
            'starts_at',
            'ends_at',
            'created_at',
            'updated_at',
        ];
    }
}
