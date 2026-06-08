<?php

namespace App\Http\Controllers\User;

use App\Events\Scoring\MatchStateUpdated;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\DeclareResultRequest;
use App\Http\Requests\User\EndMatchRequest;
use App\Http\Requests\User\ReviseTargetRequest;
use App\Jobs\RefreshMatchStatsJob;
use App\Jobs\SyncMatchGraphicContextJob;
use App\Models\TournamentMatch;
use App\Services\MatchLifecycleService;
use App\Services\MatchStateService;
use Illuminate\Http\JsonResponse;

class MatchLifecycleController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly MatchLifecycleService $matchLifecycle,
        private readonly MatchStateService $matchStateService,
    ) {}

    /**
     * Manually end or cancel a match with reason, comments, and optional 1/1 points flag.
     */
    public function end(EndMatchRequest $request, TournamentMatch $match): JsonResponse
    {
        $authUser = $request->user();

        if (! $authUser->canScoreMatchInApp($match)) {
            return $this->forbidden('You cannot score this match.');
        }

        // Status guard is enforced by MatchLifecycleService::endMatch() — throws ValidationException on violation.
        $match = $this->matchLifecycle->endMatch($match, $request->validated());

        RefreshMatchStatsJob::dispatch($match->id)->delay(now()->addSeconds(3));
        SyncMatchGraphicContextJob::dispatch($match->id);

        $matchState = $this->matchStateService->build($match->fresh());
        MatchStateUpdated::dispatch($match->id, $matchState);

        return $this->success(
            [
                'match' => [
                    'id' => $match->id,
                    'status' => $match->status->value,
                    'result_summary' => $match->resultSummary(),
                ],
                'match_state' => $matchState,
            ],
            'Match ended.',
        );
    }

    /**
     * Declare match result — award to a team or draw.
     */
    public function declareResult(DeclareResultRequest $request, TournamentMatch $match): JsonResponse
    {
        $authUser = $request->user();

        if (! $authUser->canScoreMatchInApp($match)) {
            return $this->forbidden('You cannot score this match.');
        }

        // Status guard is enforced by MatchLifecycleService::declareResult() — throws ValidationException on violation.
        $match = $this->matchLifecycle->declareResult($match, $request->validated());

        RefreshMatchStatsJob::dispatch($match->id)->delay(now()->addSeconds(3));
        SyncMatchGraphicContextJob::dispatch($match->id);

        $matchState = $this->matchStateService->build($match->fresh());
        MatchStateUpdated::dispatch($match->id, $matchState);

        return $this->success(
            [
                'match' => [
                    'id' => $match->id,
                    'status' => $match->status->value,
                    'winning_team_id' => $match->winning_team_id,
                    'result_summary' => $match->resultSummary(),
                ],
                'match_state' => $matchState,
            ],
            'Result declared.',
        );
    }

    /**
     * Revise second-innings chase target; optionally end the innings.
     */
    public function reviseTarget(ReviseTargetRequest $request, TournamentMatch $match): JsonResponse
    {
        $authUser = $request->user();

        if (! $authUser->canScoreMatchInApp($match)) {
            return $this->forbidden('You cannot score this match.');
        }

        // Status guard is enforced by MatchLifecycleService::reviseTarget() — throws ValidationException on violation.
        $match = $this->matchLifecycle->reviseTarget($match, $request->validated());

        RefreshMatchStatsJob::dispatch($match->id)->delay(now()->addSeconds(3));
        SyncMatchGraphicContextJob::dispatch($match->id);

        $scoredInnings = $match->innings()->where('innings_number', 2)->first();
        $matchState = $this->matchStateService->build($match->fresh(), $scoredInnings);
        MatchStateUpdated::dispatch($match->id, $matchState);

        return $this->success(
            [
                'match' => [
                    'id' => $match->id,
                    'revised_target' => $match->revised_target,
                    'revised_target_at' => $match->revised_target_at?->toIso8601String(),
                ],
                'match_state' => $matchState,
            ],
            'Target revised.',
        );
    }
}
