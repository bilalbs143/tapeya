<?php

namespace App\Http\Controllers\User;

use App\Enums\Event\InningsStatusEnum;
use App\Enums\Event\MatchStatusEnum;
use App\Events\Scoring\MatchStateUpdated;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\EndInningsRequest;
use App\Jobs\RefreshMatchStatsJob;
use App\Jobs\SyncMatchGraphicContextJob;
use App\Models\Innings;
use App\Models\TournamentMatch;
use App\Services\InningsLifecycleService;
use App\Services\MatchStateService;
use Illuminate\Http\JsonResponse;

class InningsLifecycleController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly InningsLifecycleService $inningsLifecycle,
        private readonly MatchStateService $matchStateService,
    ) {}

    /**
     * Manually end an innings with reason, comments, and optional 1/1 points flag.
     */
    public function end(EndInningsRequest $request, TournamentMatch $match, Innings $innings): JsonResponse
    {
        $authUser = $request->user();

        if (! $authUser->canScoreMatchInApp($match)) {
            return $this->forbidden('You cannot score this match.');
        }

        if ($innings->match_id !== $match->id) {
            return $this->notFound('Innings does not belong to this match.');
        }

        if ($match->status === MatchStatusEnum::COMPLETED) {
            return $this->conflict('Match is already completed.');
        }

        if ($innings->status === InningsStatusEnum::COMPLETED) {
            return $this->conflict('Innings is already completed.');
        }

        $innings = $this->inningsLifecycle->endInnings($match, $innings, $request->validated());

        RefreshMatchStatsJob::dispatch($match->id)->delay(now()->addSeconds(3));
        SyncMatchGraphicContextJob::dispatch($match->id);

        $matchState = $this->matchStateService->build($match->fresh(), $innings);
        MatchStateUpdated::dispatch($match->id, $matchState);

        return $this->success(
            ['match_state' => $matchState],
            'Innings ended.',
        );
    }
}
