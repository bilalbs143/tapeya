<?php

namespace App\Models;

use App\Enums\Event\MatchStatusEnum;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TournamentMatch extends BaseModel
{
    protected $table = 'matches';

    protected $fillable = [
        'tournament_id',
        'group_index',
        'home_team_id',
        'away_team_id',
        'match_date',
        'match_time',
        'venue_name',
        'players_per_side',
        'overs',
        'status',
        'winning_team_id',
        'chose_to_bat_or_bowl',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'match_date' => 'date',
            'status' => MatchStatusEnum::class,
        ];
    }

    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class, 'tournament_id');
    }

    public function homeTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'home_team_id');
    }

    public function awayTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'away_team_id');
    }

    public function winningTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'winning_team_id');
    }

    public function innings(): HasMany
    {
        return $this->hasMany(Innings::class, 'match_id');
    }
}
