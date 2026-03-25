<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreBallRequest;
use App\Http\Requests\User\UpdateBallRequest;
use App\Jobs\RefreshMatchStatsJob;
use App\Models\Ball;
use App\Models\Innings;
use App\Models\TournamentMatch;
use App\Services\PlayerStatsService;
use Illuminate\Http\JsonResponse;

class ScorecardController extends Controller
{
    use BaseControllerTrait;

    /**
     * Add a ball/delivery to an innings (Step 7 in tournament_flow).
     *
     * Only organizers. Innings must belong to the match.
     */
    public function storeBall(StoreBallRequest $request, TournamentMatch $match, Innings $innings): JsonResponse
    {
        $authUser = $request->user();

        if ($match->tournament->organizer_id !== $authUser->id) {
            return $this->forbidden('Only the tournament organizer can add balls to the scorecard.');
        }

        if ($innings->match_id !== $match->id) {
            return $this->forbidden('Innings does not belong to this match.');
        }

        $data = $request->validated();
        $data['innings_id'] = $innings->id;

        $ball = Ball::create($data);

        $innings->update(['status' => 'in_progress']);

        RefreshMatchStatsJob::dispatch($match->id);

        $ball->load(['striker', 'nonStriker', 'bowler', 'outPlayer', 'fielder']);

        return $this->success(
            [
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
            ],
            'Ball added.',
            'CREATED'
        );
    }

    /**
     * Update a ball/delivery (Step 7 in tournament_flow).
     *
     * Only organizers. Ball must belong to innings, innings to match.
     */
    public function updateBall(UpdateBallRequest $request, TournamentMatch $match, Innings $innings, Ball $ball): JsonResponse
    {
        $authUser = $request->user();

        if ($match->tournament->organizer_id !== $authUser->id) {
            return $this->forbidden('Only the tournament organizer can update balls.');
        }

        if ($innings->match_id !== $match->id || $ball->innings_id !== $innings->id) {
            return $this->forbidden('Ball does not belong to this innings and match.');
        }

        $ball->update($request->validated());

        RefreshMatchStatsJob::dispatch($match->id);

        $ball->load(['striker', 'nonStriker', 'bowler', 'outPlayer', 'fielder']);

        return $this->success([
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
        ], 'Ball updated.');
    }

    /**
     * Delete a ball/delivery (Step 7 in tournament_flow).
     *
     * Only organizers. Ball must belong to innings, innings to match.
     */
    public function deleteBall(TournamentMatch $match, Innings $innings, Ball $ball): JsonResponse
    {
        $authUser = request()->user();

        if (! $authUser || $match->tournament->organizer_id !== $authUser->id) {
            return $this->forbidden('Only the tournament organizer can delete balls.');
        }

        if ($innings->match_id !== $match->id || $ball->innings_id !== $innings->id) {
            return $this->forbidden('Ball does not belong to this innings and match.');
        }

        $ball->delete();

        RefreshMatchStatsJob::dispatch($match->id);

        return $this->success(null, 'Ball deleted.');
    }

    /**
     * Get scorecard for a match (both innings with balls and totals).
     */
    public function scorecard(TournamentMatch $match): JsonResponse
    {
        $innings = $match->innings()
            ->with(['battingTeam', 'bowlingTeam', 'balls' => fn ($q) => $q->orderBy('over')->orderBy('ball_in_over')])
            ->orderBy('innings_number')
            ->get();

        $statsService = app(PlayerStatsService::class);

        $data = [
            'match_id' => $match->id,
            'innings' => $innings->map(function (Innings $inn) use ($statsService) {
                $balls = $inn->balls;
                $totalRuns = $balls->sum('runs') + $balls->sum('penalty_runs');
                $totalWickets = $balls->where('is_wicket', true)->count();
                $totalExtras = $balls->sum('runs') - $balls->sum('runs_off_bat') + $balls->sum('penalty_runs');

                return [
                    'id' => $inn->id,
                    'innings_number' => $inn->innings_number,
                    'batting_team_id' => $inn->batting_team_id,
                    'bowling_team_id' => $inn->bowling_team_id,
                    'batting_team' => $inn->battingTeam ? ['id' => $inn->battingTeam->id, 'name' => $inn->battingTeam->name] : null,
                    'bowling_team' => $inn->bowlingTeam ? ['id' => $inn->bowlingTeam->id, 'name' => $inn->bowlingTeam->name] : null,
                    'status' => $inn->status,
                    'total_runs' => $totalRuns,
                    'total_wickets' => $totalWickets,
                    'total_extras' => $totalExtras,
                    'balls_count' => $balls->count(),
                    'partnerships' => $statsService->partnershipsForInnings($inn->id),
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
            }),
        ];

        return $this->success($data);
    }

    /**
     * Per-match player stats (batting, bowling, fielding) for scorecard/profile.
     */
    public function playerStats(TournamentMatch $match): JsonResponse
    {
        $service = app(PlayerStatsService::class);
        $data = [
            'match_id' => $match->id,
            'batting' => $service->battingForMatch($match->id),
            'bowling' => $service->bowlingForMatch($match->id),
            'fielding' => $service->fieldingForMatch($match->id),
        ];

        return $this->success($data);
    }
}
