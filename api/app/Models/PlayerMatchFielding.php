<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlayerMatchFielding extends Model
{
    protected $table = 'player_match_fielding';

    protected $fillable = [
        'player_id', 'match_id', 'matches', 'catches', 'run_outs', 'stumpings',
    ];

    public function player(): BelongsTo
    {
        return $this->belongsTo(User::class, 'player_id');
    }

    public function match(): BelongsTo
    {
        return $this->belongsTo(TournamentMatch::class, 'match_id');
    }
}
