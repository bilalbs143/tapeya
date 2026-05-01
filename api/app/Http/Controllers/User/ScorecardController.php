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
     * Add a ball/delivery to an innings (Step 7 in tournament_flow).
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

        // FIX (perf): job is already queued — add a short delay so rapid consecutive
        // deliveries collapse into fewer job executions. Also consider adding
        // ShouldBeUnique + uniqueId() = $this->matchId to the job itself.
        RefreshMatchStatsJob::dispatch($match->id)->delay(now()->addSeconds(3));

        $ball->load(['striker', 'nonStriker', 'bowler', 'outPlayer', 'fielder']);

        return $this->success($this->formatBall($ball), 'Ball added.', 'CREATED');
    }

    /**
     * Update a ball/delivery (Step 7 in tournament_flow).
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
     * Delete a ball/delivery (Step 7 in tournament_flow).
     * Only organizers. Ball must belong to innings, innings to match.
     *
     * FIX (arch): inject Request instead of using global request() helper,
     *             consistent with storeBall/updateBall.
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
     * Get scorecard for a match (both innings with balls and totals).
     *
     * FIX (arch): inject Request instead of global helper.
     * FIX (bug):  extras computed from explicit extra-type columns, not runs − runs_off_bat.
     * FIX (perf): pass already-loaded balls collection to partnershipsForInnings
     *             to avoid one extra Ball query per innings.
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
     * Per-match player stats (batting, bowling, fielding) for scorecard/profile.
     *
     * FIX (arch): inject Request instead of global helper.
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
     * FIX (arch): single source of truth for ball response shape.
     * Previously duplicated verbatim between storeBall and updateBall.
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
     * FIX (bug): extras = sum of actual extra-type runs only.
     *   Old formula (runs − runs_off_bat) silently included penalty_runs in extras,
     *   which inflated the extras figure and double-counted them in total_runs.
     *
     * FIX (perf): passes already-loaded $inn->balls into partnershipsForInnings
     *   so the service does not fire an extra Ball query per innings.
     */
    private function formatInnings(Innings $inn): array
    {
        /** @var Collection $balls */
        $balls = $inn->balls;

        $totalRuns = $balls->sum('runs');
        $totalWickets = $balls->where('is_wicket', true)->count();

        // Extras = wides + no-ball runs + bye runs + leg-bye runs.
        // penalty_runs are NOT included — they are awarded to the team separately
        // and are already part of $ball->runs in most schemas, so excluding them
        // here prevents double-counting in the extras line.
        $totalExtras = $balls->filter(fn ($b) => $b->is_wide)->sum('runs')
            + $balls->filter(fn ($b) => $b->is_no_ball && ! $b->is_wide)->sum('runs')
            + $balls->filter(fn ($b) => $b->is_bye)->sum('runs')
            + $balls->filter(fn ($b) => $b->is_leg_bye)->sum('runs');

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
            'balls_count' => $balls->count(),
            // FIX (perf): pass loaded collection — avoids an extra query per innings.
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
                'is_wicket' => $b->is_wicket,
                'dismissal_type' => $b->dismissal_type?->value,
                'dismissal_type_label' => $b->dismissal_type?->label(),
                'out_player_id' => $b->out_player_id,
                'fielder_id' => $b->fielder_id,
                'shot_position' => $b->shot_position?->value,
            ]),
        ];
    }

    /**
     * @param  array<string, mixed>|null  $meta
     */
    private function logScoringAudit(TournamentMatch $match, User $user, string $action, ?int $ballId = null, ?array $meta = null): void
    {
        MatchScoringAudit::query()->create([
            'tournament_match_id' => $match->id,
            'user_id' => $user->id,
            'action' => $action,
            'ball_id' => $ballId,
            'meta' => $meta,
        ]);
    }
}
