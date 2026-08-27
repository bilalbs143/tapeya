<?php

namespace App\Http\Controllers\User;

use App\Enums\Event\InningsStatusEnum;
use App\Enums\Event\MatchStatusEnum;
use App\Events\Scoring\MatchStateUpdated;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreAdditionalRunsRequest;
use App\Jobs\RefreshMatchStatsJob;
use App\Jobs\SyncMatchGraphicContextJob;
use App\Models\Ball;
use App\Models\Innings;
use App\Models\MatchScoringAudit;
use App\Models\TournamentMatch;
use App\Services\Broadcast\GraphicContextOrchestrator;
use App\Services\Broadcast\SyncUserOwnedOverlayCommand;
use App\Services\InningsStatsService;
use App\Services\MatchCompletionService;
use App\Services\MatchStateService;
use App\Support\BallDelivery\BallDeliveryPresenter;
use App\Support\Scoring\MatchPendingState;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdditionalRunsController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly MatchCompletionService $completionService,
        private readonly MatchStateService $matchStateService,
        private readonly SyncUserOwnedOverlayCommand $syncUserOwnedOverlayCommand,
        private readonly GraphicContextOrchestrator $graphicContextOrchestrator,
    ) {}

    public function store(StoreAdditionalRunsRequest $request, TournamentMatch $match, Innings $innings): JsonResponse
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

        $match->loadMissing('graphicSession');
        $existingBalls = $innings->balls()->orderBy('over')->orderBy('ball_in_over')->orderBy('id')->get();
        $pending = MatchPendingState::resolve($match);

        // S16: use the shared InningsStatsService::resolveLiveCrease() method.
        $crease = InningsStatsService::resolveLiveCrease($existingBalls, $pending);
        if ($crease === null) {
            return $this->failure(
                'Cannot add additional runs until openers and bowler are set on the crease.',
                'VALIDATION_ERROR',
            );
        }

        $position = InningsStatsService::nextBallPosition($existingBalls);
        $runs = (int) $request->validated('runs');
        $isFreeHit = InningsStatsService::isFreeHitDelivery($existingBalls->last());

        try {
            $ball = DB::transaction(function () use ($innings, $match, $position, $crease, $runs, $isFreeHit, $authUser) {
                $ball = $innings->balls()->create([
                    'over' => $position['over'],
                    'ball_in_over' => $position['ball_in_over'],
                    'striker_id' => $crease['striker_id'],
                    'non_striker_id' => $crease['non_striker_id'],
                    'bowler_id' => $crease['bowler_id'],
                    'runs' => 0,
                    'runs_off_bat' => 0,
                    'additional_runs' => $runs,
                    'is_no_ball' => false,
                    'is_wide' => false,
                    'is_leg_bye' => false,
                    'is_bye' => false,
                    'is_free_hit' => $isFreeHit,
                    'penalty_runs' => 0,
                    'is_wicket' => false,
                ]);

                $innings->update(['status' => InningsStatusEnum::IN_PROGRESS]);
                $this->completionService->evaluate($match->fresh());

                MatchScoringAudit::query()->create([
                    'tournament_match_id' => $match->id,
                    'user_id' => $authUser->id,
                    'action' => 'store_additional_runs',
                    'ball_id' => $ball->id,
                    'meta' => [
                        'innings_id' => $innings->id,
                        'runs' => $runs,
                    ],
                ]);

                return $ball;
            });
        } catch (QueryException $e) {
            if ($e->getCode() === '23000') {
                return $this->conflict('Could not record additional runs at this position. Please retry.');
            }
            throw $e;
        }

        MatchPendingState::clearCreaseAfterBall($match);

        RefreshMatchStatsJob::dispatch($match->id)->delay(now()->addSeconds(3));
        SyncMatchGraphicContextJob::dispatch($match->id);

        if ($this->syncUserOwnedOverlayCommand->advanceIfPresent($match->fresh() ?? $match, $authUser->id)) {
            $this->graphicContextOrchestrator->syncAndBroadcast($match->fresh() ?? $match);
        }

        $ball->load(['striker', 'nonStriker', 'bowler']);

        $matchState = $this->matchStateService->build($match->fresh(), $innings->fresh());
        MatchStateUpdated::dispatch($match->id, $matchState);

        return $this->success(
            ['ball' => $this->formatBall($ball), 'match_state' => $matchState],
            'Additional runs added.',
            'CREATED',
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function formatBall(Ball $ball): array
    {
        return [
            'id' => $ball->id,
            'innings_id' => $ball->innings_id,
            'over' => $ball->over,
            'ball_in_over' => $ball->ball_in_over,
            'striker_id' => $ball->striker_id,
            'non_striker_id' => $ball->non_striker_id,
            'bowler_id' => $ball->bowler_id,
            'runs' => $ball->runs,
            'runs_off_bat' => $ball->runs_off_bat,
            'additional_runs' => $ball->additional_runs,
            'is_no_ball' => $ball->is_no_ball,
            'is_wide' => $ball->is_wide,
            'is_leg_bye' => $ball->is_leg_bye,
            'is_bye' => $ball->is_bye,
            'is_free_hit' => $ball->is_free_hit,
            'penalty_runs' => $ball->penalty_runs,
            'is_wicket' => $ball->is_wicket,
            'presentation' => BallDeliveryPresenter::present($ball),
        ];
    }
}
