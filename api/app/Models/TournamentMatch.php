<?php

namespace App\Models;

use App\Casts\AsFile;
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
        'cancel_reason',
        'cancel_comments',
        'cancel_points_awarded_each',
        'declare_result_type',
        'declare_winner_team_id',
        'declare_result_note',
        'wagon_wheel_enabled',
        'revised_target',
        'revised_target_at',
        'winning_team_id',
        'toss_winner_team_id',
        'chose_to_bat_or_bowl',
        'is_no_result',
        'win_by_runs',
        'win_by_wickets',
        'player_of_match_user_id',
        'stream_provider_override',
        'stream_thumbnail',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'match_date' => 'date',
            'status' => MatchStatusEnum::class,
            'cancel_points_awarded_each' => 'boolean',
            'wagon_wheel_enabled' => 'boolean',
            'is_no_result' => 'boolean',
            'revised_target_at' => 'timestamp',
            'stream_thumbnail' => AsFile::class.':match-stream-thumbnails,false,media',
        ];
    }

    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class, 'tournament_id');
    }

    /**
     * Eager-load `tournament` when resolving `matches/{match}` from a route.
     *
     * The tournament is needed on virtually every match route for authorization
     * (`canScoreMatchInApp`, `canOperateTournamentInApp`). Eager-loading it here
     * avoids a lazy-load query inside the auth check on every request.
     *
     * Trade-off: routes that don't need the tournament pay one extra query.
     * For a single-resource route this is acceptable — the alternative is
     * implicit lazy loads scattered across service/auth layers.
     *
     * @param  mixed  $value
     */
    public function resolveRouteBinding($value, $field = null): static
    {
        return static::query()
            ->where($field ?? $this->getRouteKeyName(), $value)
            ->with('tournament')
            ->firstOrFail();
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

    public function declareWinnerTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'declare_winner_team_id');
    }

    public function playerOfMatch(): BelongsTo
    {
        return $this->belongsTo(User::class, 'player_of_match_user_id');
    }

    public function tossWinnerTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'toss_winner_team_id');
    }

    public function innings(): HasMany
    {
        return $this->hasMany(Innings::class, 'match_id');
    }

    public function breaks(): HasMany
    {
        return $this->hasMany(MatchBreak::class, 'match_id');
    }

    public function notes(): HasMany
    {
        return $this->hasMany(MatchNote::class, 'match_id');
    }

    public function graphicSession(): HasOne
    {
        return $this->hasOne(MatchGraphicSession::class, 'match_id');
    }

    public function stream(): HasOne
    {
        return $this->hasOne(MatchStream::class, 'match_id');
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /**
     * Custom upload URL when set; otherwise YouTube auto-thumbnail when stream is eager-loaded.
     *
     * Callers listing matches must eager-load `stream` to avoid N+1 and to populate the
     * YouTube fallback thumbnail without an extra query per row.
     */
    public function streamThumbnailUrl(): ?string
    {
        if ($this->getRawOriginal('stream_thumbnail')) {
            return $this->stream_thumbnail;
        }

        if (! $this->relationLoaded('stream')) {
            return null;
        }

        $embedId = $this->stream?->provider_playback_id;
        if (! $embedId) {
            return null;
        }

        return 'https://i.ytimg.com/vi/'.rawurlencode($embedId).'/hqdefault.jpg';
    }

    /**
     * Chase target for the second innings (DLS revised target or first innings + 1).
     */
    public function chaseTargetForSecondInnings(?int $firstInningsRuns): ?int
    {
        if ($this->revised_target !== null) {
            return (int) $this->revised_target;
        }

        if ($firstInningsRuns === null) {
            return null;
        }

        return $firstInningsRuns + 1;
    }

    /**
     * Human-readable result for completed / abandoned fixtures (null when not yet decided).
     *
     * Ensures winningTeam is loaded before accessing ->name to avoid N+1 in
     * list contexts where the relation was not eager-loaded by the caller.
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

        // Ensure the relation is loaded so ->name never triggers a hidden lazy query.
        $this->loadMissing('winningTeam');
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

    /**
     * Compact analytics settings array for API responses and match state.
     * Centralised here instead of on the controller so resources, services,
     * and controllers all read from one place.
     *
     * @return array{wagon_wheel_enabled: bool}
     */
    public function analyticsSettings(): array
    {
        return [
            'wagon_wheel_enabled' => (bool) ($this->wagon_wheel_enabled ?? false),
        ];
    }
}
