<?php

namespace App\Models;

use App\Enums\Tournament\TournamentInterestSubmissionStatusEnum;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\QueryBuilder\AllowedFilter;

class TournamentInterestSubmission extends BaseModel
{
    protected $fillable = [
        'campaign_id',
        'user_id',
        'name',
        'nickname',
        'email',
        'phone',
        'country',
        'city',
        'date_of_birth',
        'profile_picture_path',
        'id_document_path',
        'status',
        'withdrawn_at',
    ];

    protected $casts = [
        'status' => TournamentInterestSubmissionStatusEnum::class,
        'date_of_birth' => 'date',
        'withdrawn_at' => 'datetime',
    ];

    public static function getFilters(): array
    {
        return [
            AllowedFilter::exact('id'),
            AllowedFilter::exact('campaign_id'),
            AllowedFilter::exact('user_id'),
            AllowedFilter::exact('status'),
            AllowedFilter::partial('name'),
            AllowedFilter::partial('email'),
            AllowedFilter::partial('phone'),
        ];
    }

    public static function getSorts(): array
    {
        return ['id', 'name', 'status', 'created_at', 'updated_at'];
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(TournamentInterestCampaign::class, 'campaign_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
