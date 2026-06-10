<?php

namespace App\Models;

use App\Enums\Common\StatusEnum;
use App\Enums\Event\CricketFormatEnum;
use App\Enums\Event\MatchTimingEnum;
use App\Enums\Tournament\TournamentScheduleWindowEnum;
use App\Enums\Tournament\TournamentTypeEnum;
use App\Models\Relations\TournamentSquadPlayersRelation;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Spatie\QueryBuilder\AllowedFilter;

class Tournament extends BaseModel
{
    protected $table = 'tournaments';

    protected $fillable = [
        'organizer_id',
        'created_by',
        'tournament_name',
        'tournament_type',
        'cricket_format',
        'venue_name',
        'start_date',
        'end_date',
        'number_of_teams',
        'number_of_groups',
        'country',
        'city',
        'match_timings',
        'status',
        'stream_provider',
        'display_image',
        'cover_image',
        'prize',
        'likes_count',
        'dislikes_count',
        'shares_count',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tournament_type' => TournamentTypeEnum::class,
            'cricket_format' => CricketFormatEnum::class,
            'match_timings' => MatchTimingEnum::class,
            'status' => StatusEnum::class,
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    /**
     * @return array<int, string|AllowedFilter>
     */
    public static function getFilters(): array
    {
        return [
            AllowedFilter::exact('id'),
            AllowedFilter::partial('tournament_name'),
            'status',
            'tournament_type',
            'country',
            'city',
            AllowedFilter::callback('schedule_window', function (Builder $query, mixed $value): void {
                if (! is_string($value) || $value === '') {
                    return;
                }
                $phase = TournamentScheduleWindowEnum::tryFrom($value);
                if ($phase === null) {
                    return;
                }
                self::applyScheduleWindowFilter($query, $phase);
            }),
        ];
    }

    /**
     * Filter rows by calendar phase (start/end vs today). Uses date-only comparison in the app timezone.
     */
    public static function applyScheduleWindowFilter(Builder $query, TournamentScheduleWindowEnum $phase): void
    {
        $today = now()->toDateString();

        match ($phase) {
            TournamentScheduleWindowEnum::UPCOMING => $query
                ->whereNotNull('start_date')
                ->whereDate('start_date', '>', $today),
            TournamentScheduleWindowEnum::LIVE => $query
                ->whereNotNull('start_date')
                ->whereDate('start_date', '<=', $today)
                ->where(function (Builder $q) use ($today): void {
                    $q->whereNull('end_date')
                        ->orWhereDate('end_date', '>=', $today);
                }),
            TournamentScheduleWindowEnum::COMPLETED => $query
                ->whereNotNull('end_date')
                ->whereDate('end_date', '<', $today),
        };
    }

    /**
     * Derived calendar phase for UI (null when {@see $start_date} is missing).
     */
    public function schedulePhase(): ?TournamentScheduleWindowEnum
    {
        if ($this->start_date === null) {
            return null;
        }

        $today = now()->startOfDay();
        $start = $this->start_date->copy()->startOfDay();

        if ($start->isAfter($today)) {
            return TournamentScheduleWindowEnum::UPCOMING;
        }

        if ($this->end_date === null) {
            return TournamentScheduleWindowEnum::LIVE;
        }

        $end = $this->end_date->copy()->startOfDay();

        if ($end->lt($today)) {
            return TournamentScheduleWindowEnum::COMPLETED;
        }

        return TournamentScheduleWindowEnum::LIVE;
    }

    /**
     * @return array<int, string>
     */
    public static function getSorts(): array
    {
        return ['id', 'tournament_name', 'start_date', 'status', 'created_at', 'updated_at'];
    }

    /**
     * User (organizer) who manages this tournament.
     */
    public function organizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    /**
     * Backoffice (or API) user who created this tournament row (audit / scope).
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Broadcast / Match-Ops staff for this tournament (pivot).
     * At most one user per tournament (unique tournament_id on pivot).
     */
    public function broadcasters(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'tournament_broadcaster')
            ->withTimestamps();
    }

    /**
     * Teams participating in this tournament.
     * When number_of_groups > 1, each team has pivot group_index (1..number_of_groups).
     */
    public function teams(): BelongsToMany
    {
        return $this->belongsToMany(Team::class, 'tournament_team')
            ->withPivot('group_index')
            ->withTimestamps();
    }

    /**
     * App users on team rosters for teams participating in this tournament (via team_user + tournament_team).
     * A user on multiple teams appears once per team in the relation collection; use distinct() when needed.
     */
    public function squadPlayers(): BelongsToMany
    {
        $instance = $this->newRelatedInstance(User::class);

        return new TournamentSquadPlayersRelation(
            $instance->newQuery(),
            $this,
            'team_user',
            'team_id',
            'user_id',
            $this->getKeyName(),
            $instance->getKeyName(),
            __FUNCTION__,
        );
    }

    /**
     * Matches (fixtures) for this tournament.
     */
    public function matches(): HasMany
    {
        return $this->hasMany(TournamentMatch::class, 'tournament_id');
    }

    /**
     * User reactions (like/dislike) for this tournament.
     */
    public function userReactions(): HasMany
    {
        return $this->hasMany(TournamentUserReaction::class, 'tournament_id');
    }

    public function interestCampaigns(): HasMany
    {
        return $this->hasMany(TournamentInterestCampaign::class, 'tournament_id');
    }

    /**
     * Public URL for the tournament logo / display image (null when unset).
     */
    public function logoUrl(): ?string
    {
        if (! $this->display_image) {
            return null;
        }

        return Storage::disk(config('filesystems.media_disk'))->url($this->display_image);
    }

    /**
     * Eager-load count of distinct roster users for each tournament (see {@see self::squadPlayers()}).
     */
    public function scopeWithSquadPlayerCount(Builder $query): void
    {
        $qualifiedUserKey = (new User)->getQualifiedKeyName();

        $query->withAggregate(
            'squadPlayers as squad_player_count',
            DB::raw('distinct '.$qualifiedUserKey),
            'count',
        );
    }
}
