<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlayerFieldingStats extends Model
{
    protected $table = 'player_fielding_stats';

    protected $fillable = [
        'player_id', 'tournament_type', 'matches', 'catches', 'run_outs', 'stumpings',
    ];

    public function player(): BelongsTo
    {
        return $this->belongsTo(User::class, 'player_id');
    }
}
