<?php

namespace App\Models;

use App\Enums\Event\CricketFormatEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlayerBowlingStats extends Model
{
    protected $table = 'player_bowling_stats';

    protected $fillable = [
        'player_id', 'tournament_type', 'cricket_format',
        'matches', 'innings', 'overs', 'maidens', 'runs_conceded', 'wickets', 'no_balls', 'wides',
        'best_bowling_innings', 'best_bowling_match', 'five_wickets', 'ten_wickets', 'average', 'economy', 'strike_rate',
    ];

    protected function casts(): array
    {
        return [
            'cricket_format' => CricketFormatEnum::class,
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
}
