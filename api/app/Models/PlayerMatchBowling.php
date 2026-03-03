<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlayerMatchBowling extends Model
{
    protected $table = 'player_match_bowling';

    protected $fillable = [
        'player_id', 'match_id',
        'matches', 'innings', 'overs', 'maidens', 'runs_conceded', 'wickets', 'no_balls', 'wides',
        'best_bowling_innings', 'best_bowling_match', 'five_wickets', 'ten_wickets', 'average', 'economy', 'strike_rate',
    ];

    protected function casts(): array
    {
        return [
            'overs' => 'float',
            'average' => 'float',
            'economy' => 'float',
            'strike_rate' => 'float',
        ];
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(User::class, 'player_id');
    }

    public function match(): BelongsTo
    {
        return $this->belongsTo(TournamentMatch::class, 'match_id');
    }
}
