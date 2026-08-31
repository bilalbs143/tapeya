<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Event\MatchStatusEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreTournamentMatchRequest;
use App\Http\Requests\User\UpdateTournamentMatchRequest;
use App\Http\Resources\User\TournamentMatchResource;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Services\Tournament\TournamentMatchSchedulingService;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TournamentMatchController extends Controller
{
    use BaseControllerTrait;

    /** Sortable columns for the admin match list (real `matches` columns only — not computed accessors). */
    private const SORTABLE_COLUMNS = ['match_date', 'venue_name', 'status'];

    public function __construct(
        protected TournamentMatchSchedulingService $tournamentMatchSchedulingService,
    ) {}

    /**
     * List matches for a tournament (admin backoffice) — server-side filter/sort/paginate.
     */
    public function index(Request $request, Tournament $tournament): JsonResponse
    {
        $validated = $request->validate([
            'sort' => ['sometimes', 'nullable', 'string'],
            'status' => ['sometimes', 'nullable', 'string', Rule::in(MatchStatusEnum::values())],
            'from_date' => ['sometimes', 'nullable', 'date'],
            'to_date' => ['sometimes', 'nullable', 'date', 'after_or_equal:from_date'],
            'live_today' => ['sometimes', 'nullable', 'boolean'],
            'q' => ['sometimes', 'nullable', 'string', 'max:100'],
        ]);

        $query = $tournament->matches()
            ->with(['homeTeam', 'awayTeam', 'winningTeam', 'tossWinnerTeam', 'stream']);

        if (! empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }
        if (! empty($validated['from_date'])) {
            $query->whereDate('match_date', '>=', $validated['from_date']);
        }
        if (! empty($validated['to_date'])) {
            $query->whereDate('match_date', '<=', $validated['to_date']);
        }
        if (! empty($validated['live_today'])) {
            $query->whereDate('match_date', now()->toDateString());
        }
        if (! empty($validated['q'])) {
            $like = '%'.trim((string) $validated['q']).'%';
            $query->where(function ($inner) use ($like): void {
                $inner->where('venue_name', 'like', $like)
                    ->orWhereHas('homeTeam', fn ($team) => $team->where('name', 'like', $like))
                    ->orWhereHas('awayTeam', fn ($team) => $team->where('name', 'like', $like));
            });
        }

        $this->applyMatchSort($query, $validated['sort'] ?? null);

        return $this->success(TournamentMatchResource::collection($this->paginateOrAll($query)));
    }

    /**
     * Apply `sort`/`-sort` to the match query, defaulting to soonest-first by fixture date/time.
     * Restricted to {@see self::SORTABLE_COLUMNS} — computed fields (team names, result summary)
     * aren't real columns and can't be sorted server-side without a join/subquery.
     *
     * @param  HasMany<TournamentMatch, Tournament>  $query
     */
    private function applyMatchSort(HasMany $query, ?string $sort): void
    {
        $direction = 'asc';
        $column = 'match_date';
        if ($sort) {
            $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
            $candidate = ltrim($sort, '-');
            if (in_array($candidate, self::SORTABLE_COLUMNS, true)) {
                $column = $candidate;
            }
        }

        // Tournament::matches() bakes in its own default ascending order — clear it
        // before applying the requested sort, or a descending request would lose to it.
        $query->reorder()->orderBy($column, $direction);
        if ($column === 'match_date') {
            $query->orderBy('match_time', $direction);
        }
        $query->orderBy('id', $direction);
    }

    /**
     * Schedule a new fixture.
     */
    public function store(StoreTournamentMatchRequest $request, Tournament $tournament): JsonResponse
    {
        $result = $this->tournamentMatchSchedulingService->schedule(
            $tournament,
            $request->validated(),
        );

        if (! $result['ok']) {
            return $result['reason'] === 'forbidden'
                ? $this->forbidden($result['message'])
                : $this->failure($result['message'], 'VALIDATION_ERROR');
        }

        $match = $result['match']->refresh()->load(['homeTeam', 'awayTeam', 'stream']);

        return $this->success(
            new TournamentMatchResource($match),
            'Match created.',
            'CREATED'
        );
    }

    public function show(TournamentMatch $match): JsonResponse
    {
        $match->load(['homeTeam', 'awayTeam', 'tournament', 'winningTeam', 'tossWinnerTeam', 'stream']);

        return $this->success(new TournamentMatchResource($match));
    }

    /**
     * Update a scheduled fixture (schedule fields and/or stream thumbnail).
     */
    public function update(UpdateTournamentMatchRequest $request, TournamentMatch $match): JsonResponse
    {
        $result = $this->tournamentMatchSchedulingService->update(
            $match,
            $request->validated(),
        );

        if (! $result['ok']) {
            return $result['reason'] === 'forbidden'
                ? $this->forbidden($result['message'])
                : $this->failure($result['message'], 'VALIDATION_ERROR');
        }

        $match = $result['match']->refresh()->load(['homeTeam', 'awayTeam', 'stream']);

        return $this->success(new TournamentMatchResource($match), 'Match updated.');
    }
}
