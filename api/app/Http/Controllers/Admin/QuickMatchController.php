<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Event\MatchEndReasonEnum;
use App\Enums\Event\MatchKindEnum;
use App\Enums\Event\MatchStatusEnum;
use App\Events\Scoring\MatchStateUpdated;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\QuickMatchResource;
use App\Jobs\RefreshMatchStatsJob;
use App\Jobs\SyncMatchGraphicContextJob;
use App\Models\CricketMatch;
use App\Services\MatchLifecycleService;
use App\Services\MatchStateService;
use App\Services\QuickMatch\QuickMatchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class QuickMatchController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly QuickMatchService $quickMatches,
        private readonly MatchLifecycleService $lifecycle,
        private readonly MatchStateService $matchState,
    ) {}

    /**
     * GET /admin/quick-matches — moderation list.
     * Query: status, created_by, from_date, to_date, q (creator or team name).
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['sometimes', 'nullable', 'string', Rule::in(MatchStatusEnum::values())],
            'created_by' => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
            'from_date' => ['sometimes', 'nullable', 'date'],
            'to_date' => ['sometimes', 'nullable', 'date', 'after_or_equal:from_date'],
            'q' => ['sometimes', 'nullable', 'string', 'max:100'],
        ]);

        $query = CricketMatch::query()
            ->where('kind', MatchKindEnum::QUICK)
            ->with(['homeTeam', 'awayTeam', 'createdBy'])
            ->orderByDesc('match_date')
            ->orderByDesc('id');

        if (! empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }
        if (! empty($validated['created_by'])) {
            $query->where('created_by', (int) $validated['created_by']);
        }
        if (! empty($validated['from_date'])) {
            $query->whereDate('match_date', '>=', $validated['from_date']);
        }
        if (! empty($validated['to_date'])) {
            $query->whereDate('match_date', '<=', $validated['to_date']);
        }
        if (! empty($validated['q'])) {
            $like = '%'.trim((string) $validated['q']).'%';
            $query->where(function ($inner) use ($like): void {
                $inner->whereHas('createdBy', function ($creator) use ($like): void {
                    $creator->where('name', 'like', $like)
                        ->orWhere('nickname', 'like', $like);
                })->orWhereHas('homeTeam', function ($team) use ($like): void {
                    $team->where('name', 'like', $like);
                })->orWhereHas('awayTeam', function ($team) use ($like): void {
                    $team->where('name', 'like', $like);
                });
            });
        }

        return $this->success(QuickMatchResource::collection($this->paginateOrAll($query)));
    }

    public function show(CricketMatch $quickMatch): JsonResponse
    {
        return $this->success(new QuickMatchResource($this->quickMatches->loadForResource($quickMatch)));
    }

    /**
     * POST /admin/quick-matches/{id}/cancel — abuse / safety. Does not delete teams.
     */
    public function cancel(Request $request, CricketMatch $quickMatch): JsonResponse
    {
        $validated = $request->validate([
            'comments' => ['nullable', 'string', 'max:2000'],
        ]);

        $comments = isset($validated['comments']) ? trim((string) $validated['comments']) : '';
        if ($comments === '') {
            $comments = 'Cancelled from backoffice.';
        }

        try {
            $match = $this->lifecycle->endMatch($quickMatch, [
                'cancel_reason' => MatchEndReasonEnum::OTHER->value,
                'cancel_comments' => $comments,
                'cancel_points_awarded_each' => false,
            ]);
        } catch (ValidationException $e) {
            $first = collect($e->errors())->flatten()->first();

            return $this->conflict(is_string($first) ? $first : 'Match cannot be cancelled.');
        }

        RefreshMatchStatsJob::dispatch($match->id)->delay(now()->addSeconds(3));
        SyncMatchGraphicContextJob::dispatch($match->id);

        $fresh = $this->quickMatches->loadForResource($match->fresh());
        $matchState = $this->matchState->build($fresh);
        MatchStateUpdated::dispatch($fresh->id, $matchState);

        return $this->success(new QuickMatchResource($fresh), 'Quick match cancelled.');
    }
}
