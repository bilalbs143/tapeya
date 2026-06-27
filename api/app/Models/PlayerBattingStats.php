<?php

namespace App\Models;

use App\Enums\Event\CricketFormatEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlayerBattingStats extends Model
{
    protected $table = 'player_batting_stats';

    protected $fillable = [
        'player_id', 'tournament_type', 'cricket_format',
        'matches', 'innings', 'not_outs', 'runs', 'balls_faced', 'fours', 'sixes', 'dots',
        'highest_score', 'hundreds', 'fifties', 'average', 'strike_rate',
    ];

    protected function casts(): array
    {
        return [
            'cricket_format' => CricketFormatEnum::class,
            'average' => 'float',
            'strike_rate' => 'float',
        ];
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(User::class, 'player_id');
    }
}
