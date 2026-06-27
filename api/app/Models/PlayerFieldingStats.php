<?php

namespace App\Models;

use App\Enums\Event\CricketFormatEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlayerFieldingStats extends Model
{
    protected $table = 'player_fielding_stats';

    protected $fillable = [
        'player_id', 'tournament_type', 'cricket_format', 'matches', 'catches', 'run_outs', 'stumpings',
    ];

    protected function casts(): array
    {
        return [
            'cricket_format' => CricketFormatEnum::class,
        ];
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(User::class, 'player_id');
    }
}
