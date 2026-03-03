<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlayerMatchBatting extends Model
{
    protected $table = 'player_match_batting';

    protected $fillable = [
        'player_id', 'match_id',
        'matches', 'innings', 'not_outs', 'runs', 'balls_faced', 'fours', 'sixes', 'dots',
        'highest_score', 'hundreds', 'fifties', 'average', 'strike_rate',
    ];

    protected function casts(): array
    {
        return [
            'average' => 'float',
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
