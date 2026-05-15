<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Innings extends BaseModel
{
    protected $table = 'innings';

    protected $fillable = [
        'match_id',
        'innings_number',
        'batting_team_id',
        'bowling_team_id',
        'status',
    ];

    public function match(): BelongsTo
    {
        return $this->belongsTo(TournamentMatch::class, 'match_id');
    }

    public function battingTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'batting_team_id');
    }

    public function bowlingTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'bowling_team_id');
    }

    public function balls(): HasMany
    {
        return $this->hasMany(Ball::class, 'innings_id')
            ->orderBy('over')
            ->orderBy('ball_in_over')
            ->orderBy('id');  // tiebreaker: NB (lower id) always before its free-hit delivery
    }
}
