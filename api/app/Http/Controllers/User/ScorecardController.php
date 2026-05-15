<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreBallRequest;
use App\Http\Requests\User\UpdateBallRequest;
use App\Jobs\RefreshMatchStatsJob;
use App\Jobs\SyncMatchGraphicContextJob;
use App\Models\Ball;
use App\Models\Innings;
use App\Models\MatchScoringAudit;
use App\Models\TournamentMatch;
use App\Models\User;
use App\Services\InningsStatsService;
use App\Services\MatchCompletionService;
use App\Services\PlayerStatsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class ScorecardController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly MatchCompletionService $completionService,
        private readonly PlayerStatsService $statsService,
        private readonly InningsStatsService $inningsStats,
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
            return $this->forbidden('Innings does not belong to this match.');
        }

        $data = $request->validated();
        $data['innings_id'] = $innings->id;

        $ball = Ball::create($data);

        $this->logScoringAudit($match, $authUser, 'store_ball', $ball->id, ['innings_id' => $innings->id]);

        $this->clearGraphicPendingCreaseIds($match);

        $innings->update(['status' => 'in_progress']);

        $this->completionService->evaluate($match->fresh());

        RefreshMatchStatsJob::dispatch($match->id)->delay(now()->addSeconds(3));
        SyncMatchGraphicContextJob::dispatch($match->id);

        $ball->load(['striker', 'nonStriker', 'bowler', 'outPlayer', 'fielder']);

        return $this->success($this->formatBall($ball), 'Ball added.', 'CREATED');
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
            return $this->forbidden('Ball does not belong to this innings and match.');
        }

        $ball->update($request->validated());

        $this->logScoringAudit($match, $authUser, 'update_ball', $ball->id);

        $this->clearGraphicPendingCreaseIds($match);

        $this->completionService->evaluate($match->fresh());

        RefreshMatchStatsJob::dispatch($match->id)->delay(now()->addSeconds(3));
        SyncMatchGraphicContextJob::dispatch($match->id);

        $ball->load(['striker', 'nonStriker', 'bowler', 'outPlayer', 'fielder']);

        return $this->success($this->formatBall($ball), 'Ball updated.');
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
            return $this->forbidden('Ball does not belong to this innings and match.');
        }

        $this->logScoringAudit($match, $authUser, 'delete_ball', $ball->id);

        $ball->delete();

        $this->clearGraphicPendingCreaseIds($match);

        $this->completionService->evaluate($match->fresh());

        RefreshMatchStatsJob::dispatch($match->id)->delay(now()->addSeconds(3));
        SyncMatchGraphicContextJob::dispatch($match->id);

        return $this->success(null, 'Ball deleted.');
    }

    // ─── Read endpoints ───────────────────────────────────────────────────────

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
     * Single source-of-truth shape for a ball in mutation responses.
     * Includes is_free_hit so the app can replay free-hit state correctly.
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
            'is_wide' => $ball->is_wide,
            'is_leg_bye' => $ball->is_leg_bye,
            'is_bye' => $ball->is_bye,
            'is_free_hit' => $ball->is_free_hit,
            'penalty_runs' => $ball->penalty_runs,
            'is_wicket' => $ball->is_wicket,
            'dismissal_type' => $ball->dismissal_type?->value,
            'dismissal_type_label' => $ball->dismissal_type?->label(),
            'out_player_id' => $ball->out_player_id,
            'fielder_id' => $ball->fielder_id,
            'shot_position' => $ball->shot_position?->value,
        ];
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
        $extras = $stats['extras_breakdown'];

        $currentStrikerId = $stats['current_striker_id'];
        $pending = $match->graphicSession?->pending_players;
        if (is_array($pending)
            && ! empty($pending['next_batter_id'])
            && ! empty($pending['next_non_striker_id'])
            && $balls->isNotEmpty()
        ) {
            $pb = (int) $pending['next_batter_id'];
            $pn = (int) $pending['next_non_striker_id'];
            $resolved = InningsStatsService::resolveCreaseAfterBalls($balls);
            $pairBall = array_values(array_unique(array_filter(
                [(int) ($resolved['striker_id'] ?? 0), (int) ($resolved['non_striker_id'] ?? 0)],
                static fn (int $id) => $id > 0
            )));
            $pairPending = [$pb, $pn];
            sort($pairBall);
            sort($pairPending);
            if (count($pairBall) === 2 && $pairBall === $pairPending) {
                $currentStrikerId = $pb;
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
                'is_wicket' => $b->is_wicket,
                'dismissal_type' => $b->dismissal_type?->value,
                'dismissal_type_label' => $b->dismissal_type?->label(),
                'out_player_id' => $b->out_player_id,
                'fielder_id' => $b->fielder_id,
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
     * Drop crease keys from graphic pending_players after a ball mutation so
     * stale opener lines cannot override {@see InningsStatsService::resolveCreaseAfterBalls()}.
     * Manual striker / non-striker taps re-populate pending before the next delivery.
     */
    private function clearGraphicPendingCreaseIds(TournamentMatch $match): void
    {
        $session = $match->graphicSession;
        if ($session === null) {
            return;
        }
        $pending = $session->pending_players;
        if (! is_array($pending) || $pending === []) {
            return;
        }
        unset($pending['next_batter_id'], $pending['next_non_striker_id']);
        $session->update(['pending_players' => $pending === [] ? null : $pending]);
        $match->unsetRelation('graphicSession');
    }
}
