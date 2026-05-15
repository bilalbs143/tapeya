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
        'is_free_hit',
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
            'is_free_hit' => 'boolean',
            'is_wicket' => 'boolean',
            'dismissal_type' => DismissalTypeEnum::class,
            'shot_position' => ShotPositionEnum::class,
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

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

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * True when this row records only a Law 41.17-style penalty award — no
     * actual delivery (runs and runs_off_bat are zero; no extras flags).
     */
    public function isPenaltyOnlyAward(): bool
    {
        $pr = (int) ($this->penalty_runs ?? 0);
        if ($pr <= 0) {
            return false;
        }
        if ($this->is_wicket) {
            return false;
        }
        if ($this->is_wide || $this->is_no_ball || $this->is_bye || $this->is_leg_bye) {
            return false;
        }

        return (int) ($this->runs ?? 0) === 0;
    }

    /**
     * True when this ball is a valid (legal) delivery — i.e. contributes to
     * the over ball count. Wides, no-balls, and penalty-only awards do NOT count.
     */
    public function isLegalDelivery(): bool
    {
        if ($this->isPenaltyOnlyAward()) {
            return false;
        }

        return ! $this->is_wide && ! $this->is_no_ball;
    }

    /**
     * True when dismissal_type is retired_hurt (does NOT count as a wicket).
     */
    public function isRetiredHurt(): bool
    {
        return $this->dismissal_type === DismissalTypeEnum::RETIRED_HURT;
    }
}
