<?php

namespace App\Models;

use App\Casts\AsFile;
use App\Enums\Event\CricketFormatEnum;
use App\Enums\Event\MatchKindEnum;
use App\Enums\Event\MatchStatusEnum;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use InvalidArgumentException;

class TournamentMatch extends BaseModel
{
    protected $table = 'matches';

    protected $fillable = [
        'kind',
        'tournament_id',
        'created_by',
        'cricket_format',
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
        'pending_crease',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'kind' => MatchKindEnum::class,
            'cricket_format' => CricketFormatEnum::class,
            'match_date' => 'date',
            'status' => MatchStatusEnum::class,
            'cancel_points_awarded_each' => 'boolean',
            'wagon_wheel_enabled' => 'boolean',
            'is_no_result' => 'boolean',
            'created_by' => 'integer',
            'revised_target_at' => 'timestamp',
            'stream_thumbnail' => AsFile::class.':match-stream-thumbnails,false,media',
            'pending_crease' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (self $match): void {
            if ($match->venue_name === '') {
                $match->venue_name = null;
            }

            if ($match->kind === null) {
                $match->kind = MatchKindEnum::TOURNAMENT;
            }

            $match->assertKindInvariant();
        });
    }

    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class, 'tournament_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
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

    public function matchSetting(): HasOne
    {
        return $this->hasOne(MatchSetting::class, 'match_id');
    }

    public function stream(): HasOne
    {
        return $this->hasOne(MatchStream::class, 'match_id');
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    public function isQuick(): bool
    {
        return $this->kind === MatchKindEnum::QUICK;
    }

    public function isTournamentKind(): bool
    {
        return $this->kind === MatchKindEnum::TOURNAMENT || $this->kind === null;
    }

    /**
     * Serialized tournament identity for match APIs / graphics. Null when the match has no tournament.
     *
     * @return array{id: int, name: string, short_name: string, logo_url: ?string}|null
     */
    public function tournamentSummary(): ?array
    {
        if ($this->tournament_id === null) {
            return null;
        }

        $this->loadMissing('tournament');
        $tournament = $this->tournament;
        if ($tournament === null) {
            return null;
        }

        return [
            'id' => (int) $tournament->id,
            'name' => (string) ($tournament->tournament_name ?? ''),
            'short_name' => (string) ($tournament->short_name ?? ''),
            'logo_url' => $tournament->logoUrl(),
        ];
    }

    public function assertKindInvariant(): void
    {
        $kind = $this->kind instanceof MatchKindEnum
            ? $this->kind
            : MatchKindEnum::tryFrom((string) $this->kind);

        if ($kind === MatchKindEnum::QUICK) {
            if ($this->tournament_id !== null || $this->cricket_format === null || $this->created_by === null) {
                throw new InvalidArgumentException(
                    'Quick matches require tournament_id null, cricket_format, and created_by.'
                );
            }

            return;
        }

        if ($kind === MatchKindEnum::TOURNAMENT) {
            if ($this->tournament_id === null) {
                throw new InvalidArgumentException('Tournament matches require tournament_id.');
            }

            return;
        }

        throw new InvalidArgumentException('Invalid match kind.');
    }

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
     * @return array{
     *   wagon_wheel_enabled: bool,
     *   umpires: string|null,
     *   scorers: string|null,
     *   commentators: string|null
     * }
     */
    public function analyticsSettings(): array
    {
        return array_merge(
            ['wagon_wheel_enabled' => (bool) ($this->wagon_wheel_enabled ?? false)],
            MatchSetting::resolveFor($this)->toApiArray(),
        );
    }
}
