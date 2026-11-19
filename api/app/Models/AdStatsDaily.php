<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdStatsDaily extends BaseModel
{
    protected $table = 'ad_stats_daily';

    protected $fillable = [
        'date',
        'campaign_id',
        'creative_id',
        'impressions_raw',
        'impressions_unique',
        'views_raw',
        'views_unique',
        'clicks_raw',
        'clicks_unique',
        'sum_watched_ms',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date' => 'date',
            'impressions_raw' => 'integer',
            'impressions_unique' => 'integer',
            'views_raw' => 'integer',
            'views_unique' => 'integer',
            'clicks_raw' => 'integer',
            'clicks_unique' => 'integer',
            'sum_watched_ms' => 'integer',
        ];
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(AdCampaign::class, 'campaign_id');
    }

    public function creative(): BelongsTo
    {
        return $this->belongsTo(AdCreative::class, 'creative_id');
    }
}
