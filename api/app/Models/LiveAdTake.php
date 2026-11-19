<?php

namespace App\Models;

use App\Enums\Ad\LiveAdTakeModeEnum;
use App\Enums\Ad\LiveAdTakeStatusEnum;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\QueryBuilder\AllowedFilter;

class LiveAdTake extends BaseModel
{
    protected $table = 'live_ad_takes';

    protected $fillable = [
        'creative_id',
        'campaign_id',
        'mode',
        'status',
        'presentation_json',
        'note',
        'started_by_admin_id',
        'ended_by_admin_id',
        'started_at',
        'ended_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'mode' => LiveAdTakeModeEnum::class,
            'status' => LiveAdTakeStatusEnum::class,
            'presentation_json' => 'array',
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
        ];
    }

    public function creative(): BelongsTo
    {
        return $this->belongsTo(AdCreative::class, 'creative_id');
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(AdCampaign::class, 'campaign_id');
    }

    public function startedByAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'started_by_admin_id');
    }

    public function endedByAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ended_by_admin_id');
    }

    public function streams(): BelongsToMany
    {
        return $this->belongsToMany(LiveStream::class, 'live_ad_take_streams', 'take_id', 'stream_id');
    }

    /**
     * @return array<int, string|AllowedFilter>
     */
    public static function getFilters(): array
    {
        return [
            AllowedFilter::exact('status'),
            AllowedFilter::exact('mode'),
            AllowedFilter::exact('creative_id'),
            AllowedFilter::exact('campaign_id'),
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function getSorts(): array
    {
        return [
            'id',
            'status',
            'mode',
            'started_at',
            'ended_at',
            'created_at',
            'updated_at',
        ];
    }
}
