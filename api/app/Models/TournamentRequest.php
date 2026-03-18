<?php

namespace App\Models;

use App\Enums\Event\CricketFormatEnum;
use App\Enums\Event\MatchTimingEnum;
use App\Enums\Tournament\TournamentRequestStatusEnum;
use App\Enums\Tournament\TournamentTypeEnum;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\QueryBuilder\AllowedFilter;

class TournamentRequest extends BaseModel
{
    protected $table = 'tournament_requests';

    protected $fillable = [
        'user_id',
        'contact_person_name',
        'contact_phone',
        'tournament_name',
        'tournament_type',
        'cricket_format',
        'venue_name',
        'start_date',
        'end_date',
        'number_of_matches',
        'number_of_teams',
        'number_of_groups',
        'expected_players_count',
        'country',
        'city',
        'match_timings',
        'status',
        'prize',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tournament_type' => TournamentTypeEnum::class,
            'cricket_format' => CricketFormatEnum::class,
            'match_timings' => MatchTimingEnum::class,
            'status' => TournamentRequestStatusEnum::class,
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * @return array<int, string|AllowedFilter>
     */
    public static function getFilters(): array
    {
        return ['id', 'user_id', 'status', 'tournament_type', 'contact_phone', 'city'];
    }

    /**
     * @return array<int, string>
     */
    public static function getSorts(): array
    {
        return ['id', 'tournament_name', 'start_date', 'status', 'created_at', 'updated_at'];
    }
}
