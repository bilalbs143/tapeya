<?php

namespace App\Models;

use App\Enums\Event\MatchStatusEnum;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class TournamentMatch extends BaseModel
{
    protected $table = 'matches';

    protected $fillable = [
        'tournament_id',
        'group_index',
        'home_team_id',
        'away_team_id',
        'match_date',
        'match_time',
        'venue_name',
        'players_per_side',
        'overs',
        'status',
        'winning_team_id',
        'toss_winner_team_id',
        'chose_to_bat_or_bowl',
        'is_no_result',
        'win_by_runs',
        'win_by_wickets',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'match_date' => 'date',
            'status' => MatchStatusEnum::class,
            'is_no_result' => 'boolean',
        ];
    }

    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class, 'tournament_id');
    }

    public function homeTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'home_team_id');
    }

    public function awayTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'away_team_id');
    }

    public function winningTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'winning_team_id');
    }

    public function tossWinnerTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'toss_winner_team_id');
    }

    public function innings(): HasMany
    {
        return $this->hasMany(Innings::class, 'match_id');
    }

    public function graphicSession(): HasOne
    {
        return $this->hasOne(MatchGraphicSession::class, 'match_id');
    }

    /**
     * Human-readable result for completed / abandoned fixtures (null when not yet decided).
     */
    public function resultSummary(): ?string
    {
        if ($this->is_no_result) {
            return 'No Result';
        }

        if ($this->status === MatchStatusEnum::CANCELLED) {
            return 'Cancelled';
        }

        if ($this->status !== MatchStatusEnum::COMPLETED) {
            return null;
        }

        if ($this->winning_team_id === null) {
            return 'Tie';
        }

        $name = $this->winningTeam?->name ?: 'Winner';

        if ($this->win_by_wickets !== null) {
            $w = (int) $this->win_by_wickets;

            return $name.' won by '.$w.' wicket'.($w === 1 ? '' : 's');
        }

        if ($this->win_by_runs !== null) {
            $r = (int) $this->win_by_runs;

            return $name.' won by '.$r.' run'.($r === 1 ? '' : 's');
        }

        return $name.' won';
    }
}
