<?php

namespace App\Models;

use App\Enums\Event\DismissalTypeEnum;
use App\Enums\Event\ShotPositionEnum;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ball extends BaseModel
{
    protected $table = 'balls';

    protected $fillable = [
        'innings_id',
        'over',
        'ball_in_over',
        'striker_id',
        'non_striker_id',
        'bowler_id',
        'runs',
        'runs_off_bat',
        'is_no_ball',
        'is_wide',
        'is_leg_bye',
        'is_bye',
        'penalty_runs',
        'is_wicket',
        'dismissal_type',
        'out_player_id',
        'fielder_id',
        'shot_position',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_no_ball' => 'boolean',
            'is_wide' => 'boolean',
            'is_leg_bye' => 'boolean',
            'is_bye' => 'boolean',
            'is_wicket' => 'boolean',
            'dismissal_type' => DismissalTypeEnum::class,
            'shot_position' => ShotPositionEnum::class,
        ];
    }

    public function innings(): BelongsTo
    {
        return $this->belongsTo(Innings::class, 'innings_id');
    }

    public function striker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'striker_id');
    }

    public function nonStriker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'non_striker_id');
    }

    public function bowler(): BelongsTo
    {
        return $this->belongsTo(User::class, 'bowler_id');
    }

    public function outPlayer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'out_player_id');
    }

    public function fielder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'fielder_id');
    }
}
