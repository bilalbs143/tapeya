<?php

namespace App\Models;

use App\Enums\Tournament\TournamentInterestCampaignStatusEnum;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\QueryBuilder\AllowedFilter;

class TournamentInterestCampaign extends BaseModel
{
    protected $fillable = [
        'tournament_id',
        'tournament_name',
        'slug',
        'description',
        'logo_path',
        'show_in_sidebar',
        'show_dialog',
        'status',
        'created_by',
    ];

    protected $casts = [
        'show_in_sidebar' => 'boolean',
        'show_dialog' => 'boolean',
        'status' => TournamentInterestCampaignStatusEnum::class,
    ];

    public static function getFilters(): array
    {
        return [
            AllowedFilter::exact('id'),
            AllowedFilter::exact('tournament_id'),
            AllowedFilter::exact('status'),
            AllowedFilter::exact('slug'),
            AllowedFilter::partial('tournament_name'),
            AllowedFilter::callback('linked', function ($query, $value) {
                $linked = filter_var($value, FILTER_VALIDATE_BOOLEAN);
                $linked
                    ? $query->whereNotNull('tournament_id')
                    : $query->whereNull('tournament_id');
            }),
        ];
    }

    public static function getSorts(): array
    {
        return ['id', 'tournament_name', 'status', 'created_at', 'updated_at'];
    }

    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(TournamentInterestSubmission::class, 'campaign_id');
    }
}
