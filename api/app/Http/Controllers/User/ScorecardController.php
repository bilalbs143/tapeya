<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreBallRequest;
use App\Http\Requests\User\UpdateBallRequest;
use App\Jobs\RefreshMatchStatsJob;
use App\Models\Ball;
use App\Models\Innings;
use App\Models\MatchScoringAudit;
use App\Models\TournamentMatch;
use App\Models\User;
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

        $innings->update(['status' => 'in_progress']);

        $this->completionService->evaluate($match->fresh());

        RefreshMatchStatsJob::dispatch($match->id)->delay(now()->addSeconds(3));

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

        $this->completionService->evaluate($match->fresh());

        RefreshMatchStatsJob::dispatch($match->id)->delay(now()->addSeconds(3));

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

        $this->completionService->evaluate($match->fresh());

        RefreshMatchStatsJob::dispatch($match->id)->delay(now()->addSeconds(3));

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
                'balls' => fn ($q) => $q->orderBy('over')->orderBy('ball_in_over'),
            ])
            ->orderBy('innings_number')
            ->get();

        $data = [
            'match_id' => $match->id,
            'innings' => $innings->map(fn (Innings $inn) => $this->formatInnings($inn)),
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
     *
     * Extras breakdown is returned as a structured object so the frontend can
     * display Wides, No Balls, Byes, Leg Byes, and Penalty Runs individually.
     *
     * Wicket count excludes retired_hurt (law: does not count as a dismissal).
     */
    private function formatInnings(Innings $inn): array
    {
        /** @var Collection<int, Ball> $balls */
        $balls = $inn->balls;

        $totalRuns = $balls->sum('runs');

        // Retired hurt does NOT count as a wicket.
        $totalWickets = $balls->filter(
            fn (Ball $b) => $b->is_wicket && ! $b->isRetiredHurt()
        )->count();

        // Individual extras breakdown — allows frontend to display per-type totals.
        $wides = (int) $balls->filter(fn (Ball $b) => $b->is_wide)->sum('runs');
        $noBalls = (int) $balls->filter(fn (Ball $b) => $b->is_no_ball && ! $b->is_wide)->sum('runs');
        $byes = (int) $balls->filter(fn (Ball $b) => $b->is_bye)->sum('runs');
        $legByes = (int) $balls->filter(fn (Ball $b) => $b->is_leg_bye)->sum('runs');
        $penaltyRuns = (int) $balls->sum('penalty_runs');
        $totalExtras = $wides + $noBalls + $byes + $legByes + $penaltyRuns;

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
            'total_runs' => $totalRuns,
            'total_wickets' => $totalWickets,
            'total_extras' => $totalExtras,
            'extras_breakdown' => [
                'wides' => $wides,
                'no_balls' => $noBalls,
                'byes' => $byes,
                'leg_byes' => $legByes,
                'penalty_runs' => $penaltyRuns,
            ],
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
}
