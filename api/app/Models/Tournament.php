<?php

namespace App\Models;

use App\Enums\Common\StatusEnum;
use App\Enums\Event\CricketFormatEnum;
use App\Enums\Event\MatchTimingEnum;
use App\Enums\Tournament\TournamentTypeEnum;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\QueryBuilder\AllowedFilter;

class Tournament extends BaseModel
{
    protected $table = 'tournaments';

    protected $fillable = [
        'organizer_id',
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
        'display_image',
        'cover_image',
        'prize',
        'likes_count',
        'dislikes_count',
        'shares_count',
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
            'status' => StatusEnum::class,
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    /**
     * @return array<int, string|AllowedFilter>
     */
    public static function getFilters(): array
    {
        return [
            AllowedFilter::exact('id'),
            'status',
            'tournament_type',
            AllowedFilter::exact('organizer_id'),
            'country',
            'city',
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function getSorts(): array
    {
        return ['id', 'tournament_name', 'start_date', 'status', 'created_at', 'updated_at'];
    }

    /**
     * User (organizer) who manages this tournament.
     */
    public function organizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    /**
     * Teams participating in this tournament.
     */
    /**
     * Teams participating in this tournament.
     * When number_of_groups > 1, each team has pivot group_index (1..number_of_groups).
     */
    public function teams(): BelongsToMany
    {
        return $this->belongsToMany(Team::class, 'tournament_team')
            ->withPivot('group_index')
            ->withTimestamps();
    }

    /**
     * Matches (fixtures) for this tournament.
     */
    public function matches(): HasMany
    {
        return $this->hasMany(TournamentMatch::class, 'tournament_id');
    }

    /**
     * User reactions (like/dislike) for this tournament.
     */
    public function userReactions(): HasMany
    {
        return $this->hasMany(TournamentUserReaction::class, 'tournament_id');
    }
}
