<?php

namespace App\Models;

use App\Enums\Ad\AdEventTypeEnum;
use App\Enums\Ad\AdSurfaceEnum;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdEvent extends BaseModel
{
    public $timestamps = false;

    protected $table = 'ad_events';

    protected $fillable = [
        'campaign_id',
        'creative_id',
        'post_id',
        'brand_partner_id',
        'take_id',
        'event_type',
        'user_id',
        'viewer_key',
        'surface',
        'platform',
        'watched_ms',
        'completion_rate',
        'client_event_id',
        'occurred_at',
        'meta',
        'created_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'event_type' => AdEventTypeEnum::class,
            'surface' => AdSurfaceEnum::class,
            'watched_ms' => 'integer',
            'completion_rate' => 'float',
            'occurred_at' => 'datetime',
            'meta' => 'array',
            'created_at' => 'datetime',
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

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    public function brandPartner(): BelongsTo
    {
        return $this->belongsTo(BrandPartner::class);
    }

    public function take(): BelongsTo
    {
        return $this->belongsTo(LiveAdTake::class, 'take_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
