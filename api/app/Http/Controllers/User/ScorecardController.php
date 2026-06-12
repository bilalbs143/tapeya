<?php

namespace App\Http\Controllers\User;

use App\Enums\Event\DismissalTypeEnum;
use App\Enums\Event\InningsStatusEnum;
use App\Enums\Event\MatchStatusEnum;
use App\Events\Broadcast\Graphics\MatchGraphicFlashDispatched;
use App\Events\Scoring\MatchStateUpdated;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreBallRequest;
use App\Http\Requests\User\UpdateBallRequest;
use App\Jobs\RefreshMatchStatsJob;
use App\Jobs\SyncMatchGraphicContextJob;
use App\Models\Ball;
use App\Models\Innings;
use App\Models\MatchGraphicSession;
use App\Models\MatchScoringAudit;
use App\Models\TournamentMatch;
use App\Models\User;
use App\Services\BallDeliveryNormalizer;
use App\Services\Broadcast\ScoringFlashResolver;
use App\Services\InningsStatsService;
use App\Services\MatchCompletionService;
use App\Services\MatchStateService;
use App\Services\PlayerStatsService;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ScorecardController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly MatchCompletionService $completionService,
        private readonly PlayerStatsService $statsService,
        private readonly InningsStatsService $inningsStats,
        private readonly MatchStateService $matchStateService,
    ) {}

    // ─── Mutation endpoints ───────────────────────────────────────────────────

    /**
     * Add a ball/delivery to an innings.
     * Only organizers. Innings must belong to the match.
     */
    public function storeBall(StoreBallRequest $request, TournamentMatch $match, Innings $innings): JsonResponse
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

        $data = BallDeliveryNormalizer::normalize($request->validated());

        // Compute server-side fields from existing innings ball history.
        $existingBalls = $innings->balls()->get();
        $data = $this->computeBallFields($data, $existingBalls);

        $match->loadMissing('graphicSession');
        $pending = is_array($match->graphicSession?->pending_players)
            ? $match->graphicSession->pending_players
            : [];

        $creaseError = $this->applyAuthoritativeCreaseToBallData($data, $existingBalls, $pending);
        if ($creaseError !== null) {
            return $creaseError;
        }

        // Law 21.18 — on a free-hit only run_out, obstructing_the_field, and
        // hit_ball_twice are valid dismissals.  Enforced server-side because
        // is_free_hit is now computed here, not sent by the client.
        if ($data['is_free_hit'] && ($data['is_wicket'] ?? false)) {
            $dismissal = $data['dismissal_type'] ?? null;
            if ($dismissal !== null) {
                $type = DismissalTypeEnum::tryFrom($dismissal);
                if ($type !== null && ! $type->validOnFreeHit()) {
                    return $this->failure(
                        'On a free-hit delivery only run out, obstructing the field, or hitting the ball twice are valid dismissals.',
                        'VALIDATION_ERROR',
                    );
                }
            }
        }

        if (($data['is_wicket'] ?? false) && ($data['is_wide'] ?? false)) {
            $dismissal = $data['dismissal_type'] ?? null;
            $type = $dismissal !== null ? DismissalTypeEnum::tryFrom($dismissal) : null;
            if ($type === null || ! $type->validOnWideDelivery()) {
                return $this->failure(
                    'On a wide delivery only run out and stumped are valid dismissals.',
                    'VALIDATION_ERROR',
                );
            }
        }

        if (($data['is_wicket'] ?? false) && ($data['is_no_ball'] ?? false) && ! ($data['is_free_hit'] ?? false)) {
            $dismissal = $data['dismissal_type'] ?? null;
            $type = $dismissal !== null ? DismissalTypeEnum::tryFrom($dismissal) : null;
            if ($type === null || ! $type->validOnNoBallDelivery()) {
                return $this->failure(
                    'On a no-ball delivery only run out, obstructing the field, or hitting the ball twice are valid dismissals.',
                    'VALIDATION_ERROR',
                );
            }
        }

        try {
            $ball = DB::transaction(function () use ($data, $innings, $match) {
                $ball = $innings->balls()->create($data);
                $innings->update(['status' => InningsStatusEnum::IN_PROGRESS]);
                $this->completionService->evaluate($match->fresh());

                return $ball;
            });
        } catch (QueryException $e) {
            // Unique constraint violation on (innings_id, over, ball_in_over) means a
            // concurrent request already recorded this delivery — safe to retry.
            if ($e->getCode() === '23000') {
                return $this->conflict('Delivery already recorded at this position. Please retry.');
            }
            throw $e;
        }

        $this->logScoringAudit($match, $authUser, 'store_ball', $ball->id, ['innings_id' => $innings->id]);

        // Clear pending batter slots when they match the dismissed player on this wicket.
        $this->clearGraphicPendingCreaseIds(
            $match,
            isWicket: (bool) ($data['is_wicket'] ?? false),
            outPlayerId: ($data['is_wicket'] ?? false) && ! empty($data['out_player_id'])
                ? (int) $data['out_player_id']
                : null,
        );

        RefreshMatchStatsJob::dispatch($match->id)->delay(now()->addSeconds(3));
        SyncMatchGraphicContextJob::dispatch($match->id);

        $this->dispatchScoringFlash($match, $ball);

        $ball->load(['striker', 'nonStriker', 'bowler', 'outPlayer', 'fielder']);

        $matchState = $this->matchStateService->build($match->fresh(), $innings->fresh());
        MatchStateUpdated::dispatch($match->id, $matchState);

        return $this->success(
            ['ball' => $this->formatBallWithCreaseTime($ball, $innings->fresh()), 'match_state' => $matchState],
            'Ball added.',
            'CREATED'
        );
    }

    /**
     * Update a ball/delivery.
     * Only organizers. Ball must belong to innings, innings to match.
     */
    public function updateBall(UpdateBallRequest $request, TournamentMatch $match, Innings $innings, Ball $ball): JsonResponse
    {
        $authUser = $request->user();

        if (! $authUser->canScoreMatchInApp($match)) {
            return $this->forbidden('You cannot score this match.');
        }

        if ($innings->match_id !== $match->id || $ball->innings_id !== $innings->id) {
            return $this->notFound('Ball does not belong to this innings and match.');
        }

        if ($match->status === MatchStatusEnum::COMPLETED) {
            return $this->conflict('Match is already completed.');
        }

        if ($innings->status === InningsStatusEnum::COMPLETED) {
            return $this->conflict('Innings is already completed.');
        }

        $data = BallDeliveryNormalizer::normalize(array_merge(
            [
                'is_no_ball' => $ball->is_no_ball,
                'no_ball_type' => $ball->no_ball_type,
                'no_ball_runs_type' => $ball->no_ball_runs_type,
                'overthrow_delivery_type' => $ball->overthrow_delivery_type,
                'is_bye' => $ball->is_bye,
                'is_leg_bye' => $ball->is_leg_bye,
                'runs_off_bat' => $ball->runs_off_bat,
                'extra_runs' => max(0, (int) $ball->runs - (int) $ball->runs_off_bat - (($ball->is_wide || $ball->is_no_ball) ? 1 : 0)),
            ],
            $request->validated(),
        ));

        // Recompute runs when any runs-affecting field is being corrected.
        if ($this->hasRunsAffectingField($data)) {
            $runsOffBat = (int) ($data['runs_off_bat'] ?? $ball->runs_off_bat ?? 0);
            $isWide = isset($data['is_wide']) ? (bool) $data['is_wide'] : (bool) $ball->is_wide;
            $isNoBall = isset($data['is_no_ball']) ? (bool) $data['is_no_ball'] : (bool) $ball->is_no_ball;
            $widePenalty = ($isWide || $isNoBall) ? 1 : 0;

            if (isset($data['extra_runs'])) {
                $extraRuns = (int) $data['extra_runs'];
            } else {
                // Derive from existing stored value.
                $oldPenalty = ((bool) $ball->is_wide || (bool) $ball->is_no_ball) ? 1 : 0;
                $extraRuns = max(0, (int) ($ball->runs ?? 0) - (int) ($ball->runs_off_bat ?? 0) - $oldPenalty);
            }

            $data['runs'] = $runsOffBat + $extraRuns + $widePenalty;
        }

        unset($data['extra_runs']);

        DB::transaction(function () use ($ball, $data, $match) {
            $ball->update($data);
            $isWicket = (bool) ($data['is_wicket'] ?? $ball->is_wicket);
            $this->clearGraphicPendingCreaseIds(
                $match,
                isWicket: $isWicket,
                outPlayerId: $isWicket && ($data['out_player_id'] ?? $ball->out_player_id)
                    ? (int) ($data['out_player_id'] ?? $ball->out_player_id)
                    : null,
            );
            $this->completionService->evaluate($match->fresh());
        });

        $this->logScoringAudit($match, $authUser, 'update_ball', $ball->id);

        RefreshMatchStatsJob::dispatch($match->id)->delay(now()->addSeconds(3));
        SyncMatchGraphicContextJob::dispatch($match->id);

        $ball->load(['striker', 'nonStriker', 'bowler', 'outPlayer', 'fielder']);

        $matchState = $this->matchStateService->build($match->fresh(), $innings->fresh());
        MatchStateUpdated::dispatch($match->id, $matchState);

        return $this->success(
            ['ball' => $this->formatBall($ball), 'match_state' => $matchState],
            'Ball updated.'
        );
    }

    /**
     * Delete a ball/delivery (undo).
     * Only organizers. Ball must belong to innings, innings to match.
     */
    public function deleteBall(Request $request, TournamentMatch $match, Innings $innings, Ball $ball): JsonResponse
    {
        $authUser = $request->user();

        if (! $authUser || ! $authUser->canScoreMatchInApp($match)) {
            return $this->forbidden('You cannot score this match.');
        }

        if ($innings->match_id !== $match->id || $ball->innings_id !== $innings->id) {
            return $this->notFound('Ball does not belong to this innings and match.');
        }

        $this->logScoringAudit($match, $authUser, 'delete_ball', $ball->id);

        $ballId = $ball->id;

        $ball->delete();

        $this->clearGraphicPendingCreaseIds($match);

        $this->completionService->evaluate($match->fresh());

        RefreshMatchStatsJob::dispatch($match->id)->delay(now()->addSeconds(3));
        SyncMatchGraphicContextJob::dispatch($match->id);

        $this->cancelScoringFlash($match, $ballId);

        $matchState = $this->matchStateService->build($match->fresh(), $innings->fresh());
        MatchStateUpdated::dispatch($match->id, $matchState);

        return $this->success(['match_state' => $matchState], 'Ball deleted.');
    }

    /**
     * Delete the most recent ball in an innings (semantic undo).
     * Works regardless of whether the caller knows the ball ID — safe across
     * page reloads, WebSocket reconnects, and multi-device scoring.
     */
    public function deleteLastBall(Request $request, TournamentMatch $match, Innings $innings): JsonResponse
    {
        $authUser = $request->user();

        if (! $authUser || ! $authUser->canScoreMatchInApp($match)) {
            return $this->forbidden('You cannot score this match.');
        }

        if ($innings->match_id !== $match->id) {
            return $this->notFound('Innings does not belong to this match.');
        }

        $ball = $innings->balls()
            ->reorder()
            ->orderByDesc('over')
            ->orderByDesc('ball_in_over')
            ->orderByDesc('id')
            ->first();
        if (! $ball) {
            return $this->failure('No balls to undo.', 'NOT_FOUND');
        }

        $this->logScoringAudit($match, $authUser, 'delete_last_ball', $ball->id);

        $ballId = $ball->id;

        $ball->delete();

        $this->clearGraphicPendingCreaseIds($match);

        $this->completionService->evaluate($match->fresh());

        RefreshMatchStatsJob::dispatch($match->id)->delay(now()->addSeconds(3));
        SyncMatchGraphicContextJob::dispatch($match->id);

        $this->cancelScoringFlash($match, $ballId);

        $matchState = $this->matchStateService->build($match->fresh(), $innings->fresh());
        MatchStateUpdated::dispatch($match->id, $matchState);

        return $this->success(['match_state' => $matchState], 'Last ball deleted.');
    }

    // ─── Read endpoints ───────────────────────────────────────────────────────

    /**
     * Complete current match state — used for initial app hydration.
     * Replaces the scorecard + replay approach.
     */
    public function matchState(Request $request, TournamentMatch $match): JsonResponse
    {
        $user = $request->user();
        if (! $user || ! $user->canScoreMatchInApp($match)) {
            return $this->forbidden('You cannot view this match state.');
        }

        return $this->success($this->matchStateService->build($match));
    }

    /**
     * Full scorecard for a match (both innings with balls, partnerships, and extras breakdown).
     */
    public function scorecard(Request $request, TournamentMatch $match): JsonResponse
    {
        $user = $request->user();
        if (! $user || ! $user->canScoreMatchInApp($match)) {
            return $this->forbidden('You cannot view this scorecard.');
        }

        $innings = $match->innings()
            ->with([
                'battingTeam',
                'bowlingTeam',
                'balls' => fn ($q) => $q
                    ->with(['striker:id,name', 'nonStriker:id,name', 'bowler:id,name', 'outPlayer:id,name', 'fielder:id,name'])
                    ->orderBy('over')->orderBy('ball_in_over')->orderBy('id'),
            ])
            ->orderBy('innings_number')
            ->get();

        $match->loadMissing('graphicSession');

        $data = [
            'match_id' => $match->id,
            'innings' => $innings->map(fn (Innings $inn) => $this->formatInnings($match, $inn)),
        ];

        return $this->success($data);
    }

    /**
     * Per-match player stats (batting, bowling, fielding) for scorecard / profile.
     */
    public function playerStats(Request $request, TournamentMatch $match): JsonResponse
    {
        $user = $request->user();
        if (! $user || ! $user->canScoreMatchInApp($match)) {
            return $this->forbidden('You cannot view match player stats.');
        }

        return $this->success([
            'match_id' => $match->id,
            'batting' => $this->statsService->battingForMatch($match->id),
            'bowling' => $this->statsService->bowlingForMatch($match->id),
            'fielding' => $this->statsService->fieldingForMatch($match->id),
        ]);
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    /**
     * Compute server-side ball fields (over, ball_in_over, runs, is_free_hit)
     * and remove the client-only extra_runs field before DB insert.
     *
     * @param  array<string, mixed>  $data  Validated request data
     * @param  Collection<int, Ball>  $existingBalls  All balls already in the innings
     * @return array<string, mixed>
     */
    private function computeBallFields(array $data, Collection $existingBalls): array
    {
        $position = InningsStatsService::nextBallPosition($existingBalls);
        $lastBall = $existingBalls->last();
        $isFreeHit = InningsStatsService::isFreeHitDelivery($lastBall);

        $runsOffBat = (int) ($data['runs_off_bat'] ?? 0);
        $extraRuns = (int) ($data['extra_runs'] ?? 0);
        $isWide = (bool) ($data['is_wide'] ?? false);
        $isNoBall = (bool) ($data['is_no_ball'] ?? false);
        $runs = $runsOffBat + $extraRuns + (($isWide || $isNoBall) ? 1 : 0);

        unset($data['extra_runs']);

        return array_merge($data, [
            'over' => $position['over'],
            'ball_in_over' => $position['ball_in_over'],
            'runs' => $runs,
            'is_free_hit' => $isFreeHit,
        ]);
    }

    /**
     * True when the update request contains any field that affects the runs total.
     *
     * @param  array<string, mixed>  $data
     */
    private function hasRunsAffectingField(array $data): bool
    {
        return (bool) array_intersect_key(
            $data,
            array_flip(['runs_off_bat', 'extra_runs', 'is_wide', 'is_no_ball', 'is_bye', 'is_leg_bye']),
        );
    }

    /**
     * Single source-of-truth shape for a ball in mutation responses.
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
            'is_no_ball' => $ball->is_no_ball,
            'no_ball_type' => $ball->no_ball_type,
            'no_ball_runs_type' => $ball->no_ball_runs_type,
            'overthrow_delivery_type' => $ball->overthrow_delivery_type,
            'is_wide' => $ball->is_wide,
            'is_leg_bye' => $ball->is_leg_bye,
            'is_bye' => $ball->is_bye,
            'is_free_hit' => $ball->is_free_hit,
            'penalty_runs' => $ball->penalty_runs,
            'penalty_team' => $ball->penalty_team,
            'penalty_reason' => $ball->penalty_reason,
            'additional_runs' => $ball->additional_runs,
            'is_wicket' => $ball->is_wicket,
            'dismissal_type' => $ball->dismissal_type?->value,
            'dismissal_type_label' => $ball->dismissal_type?->label(),
            'out_player_id' => $ball->out_player_id,
            'fielder_id' => $ball->fielder_id,
            'runout_extra_runs' => $ball->runout_extra_runs,
            'runout_run_type' => $ball->runout_run_type,
            'batter_crossed' => $ball->batter_crossed,
            'dont_count_ball' => $ball->dont_count_ball,
            'dismissal_delivery_type' => $ball->dismissal_delivery_type,
            'shot_position' => $ball->shot_position?->value,
        ];
    }

    /**
     * Include crease time for dismissed batters on wicket balls.
     */
    private function formatBallWithCreaseTime(Ball $ball, Innings $innings): array
    {
        $formatted = $this->formatBall($ball);

        if (
            ! $ball->is_wicket
            || $ball->out_player_id === null
            || $ball->dismissal_type === DismissalTypeEnum::RETIRED_HURT
        ) {
            return $formatted;
        }

        $allBalls = $innings->balls()
            ->orderBy('over')
            ->orderBy('ball_in_over')
            ->orderBy('id')
            ->get();

        $names = InningsStatsService::namesFromRelations($allBalls);
        $stats = $this->inningsStats->compute($allBalls, $names);
        $outId = (int) $ball->out_player_id;
        $outRow = $stats['batting_by_id'][$outId] ?? null;

        $formatted['out_player_crease_time_seconds'] = $outRow['crease_time_seconds'] ?? null;
        $formatted['out_player_name'] = $ball->outPlayer?->name ?? ($names[$outId] ?? null);

        if ($outRow !== null) {
            $balls = (int) ($outRow['balls'] ?? 0);
            $runs = (int) ($outRow['runs'] ?? 0);
            $formatted['out_player_stats'] = [
                'runs' => $runs,
                'balls' => $balls,
                'fours' => (int) ($outRow['fours'] ?? 0),
                'sixes' => (int) ($outRow['sixes'] ?? 0),
                'strike_rate' => $balls > 0
                    ? number_format(($runs / $balls) * 100, 1, '.', '')
                    : '0.0',
            ];
        }

        return $formatted;
    }

    /**
     * Format a single innings for the scorecard response.
     */
    private function formatInnings(TournamentMatch $match, Innings $inn): array
    {
        /** @var Collection<int, Ball> $balls */
        $balls = $inn->balls;

        $names = InningsStatsService::namesFromRelations($balls);
        $stats = $this->inningsStats->compute($balls, $names);
        $crossPenalty = InningsStatsService::crossInningsPenaltyRunsForBattingTeam(
            $match,
            (int) $inn->batting_team_id,
        );
        $stats = InningsStatsService::applyCrossInningsPenalties($stats, $crossPenalty);
        $extras = $stats['extras_breakdown'];

        $currentStrikerId = $stats['current_striker_id'];
        $pending = $match->graphicSession?->pending_players;
        if (is_array($pending) && $balls->isNotEmpty()) {
            $merged = InningsStatsService::resolveExpectedCrease($balls, $pending);
            if ($merged['striker_id'] !== null) {
                $currentStrikerId = $merged['striker_id'];
            }
        }

        return [
            'id' => $inn->id,
            'innings_number' => $inn->innings_number,
            'batting_team_id' => $inn->batting_team_id,
            'bowling_team_id' => $inn->bowling_team_id,
            'batting_team' => $inn->battingTeam
                ? ['id' => $inn->battingTeam->id, 'name' => $inn->battingTeam->name]
                : null,
            'bowling_team' => $inn->bowlingTeam
                ? ['id' => $inn->bowlingTeam->id, 'name' => $inn->bowlingTeam->name]
                : null,
            'status' => $inn->status,
            'total_runs' => $stats['total_runs'],
            'total_wickets' => $stats['total_wickets'],
            'total_extras' => $extras['total'],
            'extras_breakdown' => [
                'wides' => $extras['wides'],
                'no_balls' => $extras['no_balls'],
                'byes' => $extras['byes'],
                'leg_byes' => $extras['leg_byes'],
                'penalty_runs' => $extras['penalty_runs'],
            ],
            'overs_display' => InningsStatsService::oversDisplay($stats['legal_balls']),
            'run_rate' => InningsStatsService::runRate($stats['total_runs'], $stats['legal_balls']),
            'current_striker_id' => $currentStrikerId,
            'batting_stats' => $stats['batting'],
            'bowling_stats' => $stats['bowling'],
            'fall_of_wickets' => $stats['fall_of_wickets'],
            'balls_count' => $balls->count(),
            'partnerships' => $this->statsService->partnershipsForInnings($inn->id, $balls),
            'balls' => $balls->map(fn (Ball $b) => [
                'id' => $b->id,
                'over' => $b->over,
                'ball_in_over' => $b->ball_in_over,
                'striker_id' => $b->striker_id,
                'non_striker_id' => $b->non_striker_id,
                'bowler_id' => $b->bowler_id,
                'runs' => $b->runs,
                'runs_off_bat' => $b->runs_off_bat,
                'is_no_ball' => $b->is_no_ball,
                'is_wide' => $b->is_wide,
                'is_leg_bye' => $b->is_leg_bye,
                'is_bye' => $b->is_bye,
                'is_free_hit' => $b->is_free_hit,
                'penalty_runs' => $b->penalty_runs,
                'penalty_team' => $b->penalty_team,
                'penalty_reason' => $b->penalty_reason,
                'additional_runs' => $b->additional_runs,
                'is_wicket' => $b->is_wicket,
                'dismissal_type' => $b->dismissal_type?->value,
                'dismissal_type_label' => $b->dismissal_type?->label(),
                'out_player_id' => $b->out_player_id,
                'fielder_id' => $b->fielder_id,
                'runout_extra_runs' => $b->runout_extra_runs,
                'runout_run_type' => $b->runout_run_type,
                'batter_crossed' => $b->batter_crossed,
                'shot_position' => $b->shot_position?->value,
            ])->values(),
        ];
    }

    /**
     * @param  array<string, mixed>|null  $meta
     */
    private function logScoringAudit(
        TournamentMatch $match,
        User $user,
        string $action,
        ?int $ballId = null,
        ?array $meta = null,
    ): void {
        MatchScoringAudit::query()->create([
            'tournament_match_id' => $match->id,
            'user_id' => $user->id,
            'action' => $action,
            'ball_id' => $ballId,
            'meta' => $meta,
        ]);
    }

    /**
     * Derive authoritative striker/non-striker for the next delivery and validate wicket metadata.
     *
     * @param  array<string, mixed>  $data  Normalized ball payload (mutated in place).
     * @param  Collection<int, Ball>  $existingBalls
     * @param  array<string, mixed>  $pending
     */
    private function applyAuthoritativeCreaseToBallData(array &$data, Collection $existingBalls, array $pending): ?JsonResponse
    {
        $merged = InningsStatsService::resolveExpectedCrease($existingBalls, $pending);
        $expectedStriker = $merged['striker_id'];
        $expectedNonStriker = $merged['non_striker_id'];

        if ($expectedStriker === null || $expectedNonStriker === null) {
            return $this->failure(
                'Select incoming batsman before recording the next delivery.',
                'NEEDS_NEW_BATTER',
            );
        }

        $data['striker_id'] = $expectedStriker;
        $data['non_striker_id'] = $expectedNonStriker;

        if (! ($data['is_wicket'] ?? false)) {
            return null;
        }

        $outId = (int) ($data['out_player_id'] ?? 0);
        if ($outId <= 0) {
            return $this->failure('Dismissed batter is required for a wicket ball.', 'VALIDATION_ERROR');
        }

        $onCrease = [(int) $expectedStriker, (int) $expectedNonStriker];
        if (! in_array($outId, $onCrease, true)) {
            return $this->failure(
                'The dismissed batter must be one of the two batters on crease for this delivery.',
                'OUT_PLAYER_NOT_ON_CREASE',
            );
        }

        $dismissedIds = InningsStatsService::dismissedPlayerIdsFromBalls($existingBalls);
        if (in_array($outId, $dismissedIds, true)) {
            return $this->failure(
                'This batter has already been dismissed in this innings.',
                'PLAYER_ALREADY_DISMISSED',
            );
        }

        return null;
    }

    /**
     * Drop crease keys from graphic pending_players after a ball mutation so
     * stale opener lines cannot override {@see InningsStatsService::resolveCreaseAfterBalls()}.
     *
     * @param  bool  $isWicket  True when the ball just stored/updated is a dismissal.
     * @param  int|null  $outPlayerId  Dismissed player on a wicket ball — pending IDs matching
     *                                 this player are cleared so they are not re-applied.
     *
     * On a wicket ball, pending batter slots are preserved **unless** they match
     * `out_player_id` (the incoming batter was dismissed before facing a ball).
     * On non-wicket balls the ball record is authoritative — batter pending is cleared.
     *
     * The next_bowler_id is always cleared because it is captured on the ball row
     * itself and must not linger between overs.
     */
    private function clearGraphicPendingCreaseIds(
        TournamentMatch $match,
        bool $isWicket = false,
        ?int $outPlayerId = null,
    ): void {
        $session = $match->graphicSession;
        if ($session === null) {
            return;
        }
        $pending = $session->pending_players;
        if (! is_array($pending) || $pending === []) {
            return;
        }

        // Always clear the pending bowler — it is stored on the ball row.
        unset($pending['next_bowler_id']);

        if ($isWicket && $outPlayerId !== null && $outPlayerId > 0) {
            if (isset($pending['next_batter_id']) && (int) $pending['next_batter_id'] === $outPlayerId) {
                unset($pending['next_batter_id']);
            }
            if (isset($pending['next_non_striker_id']) && (int) $pending['next_non_striker_id'] === $outPlayerId) {
                unset($pending['next_non_striker_id']);
            }
        } elseif (! $isWicket) {
            unset($pending['next_batter_id'], $pending['next_non_striker_id']);
        }

        unset($pending['substitute_replaced_id'], $pending['substitute_player_id']);

        $session->update(['pending_players' => $pending === [] ? null : $pending]);
        $match->unsetRelation('graphicSession');
    }

    private function dispatchScoringFlash(TournamentMatch $match, Ball $ball): void
    {
        $session = $match->graphicSession;
        if (! $session instanceof MatchGraphicSession) {
            return;
        }

        $config = is_array($session->config) ? $session->config : [];
        if (($config['scoring_flash_enabled'] ?? true) === false) {
            return;
        }

        $commands = ScoringFlashResolver::resolve($ball);
        if ($commands === []) {
            return;
        }

        MatchGraphicFlashDispatched::dispatchFromSession($session, $ball->id, $commands);
    }

    private function cancelScoringFlash(TournamentMatch $match, int $ballId): void
    {
        $session = $match->loadMissing('graphicSession')->graphicSession;
        if (! $session instanceof MatchGraphicSession) {
            return;
        }

        MatchGraphicFlashDispatched::dispatchFromSession($session, $ballId, []);
    }
}
