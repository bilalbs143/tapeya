<?php

namespace App\Models;

use App\Enums\Ad\AdCreativeStatusEnum;
use App\Enums\Ad\AdCtaTypeEnum;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\QueryBuilder\AllowedFilter;

class AdCreative extends BaseModel
{
    protected $table = 'ad_creatives';

    protected $fillable = [
        'campaign_id',
        'post_id',
        'name',
        'headline',
        'cta_label',
        'cta_url',
        'cta_type',
        'disclosure_label',
        'status',
        'weight',
        'reviewed_by_admin_id',
        'reviewed_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'cta_type' => AdCtaTypeEnum::class,
            'status' => AdCreativeStatusEnum::class,
            'weight' => 'integer',
            'reviewed_at' => 'datetime',
        ];
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(AdCampaign::class, 'campaign_id');
    }

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    public function reviewedByAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_admin_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(AdEvent::class, 'creative_id');
    }

    public function takes(): HasMany
    {
        return $this->hasMany(LiveAdTake::class, 'creative_id');
    }

    /**
     * @return array<int, string|AllowedFilter>
     */
    public static function getFilters(): array
    {
        return [
            AllowedFilter::exact('status'),
            AllowedFilter::exact('campaign_id'),
            AllowedFilter::exact('post_id'),
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
            'weight',
            'created_at',
            'updated_at',
        ];
    }
}
