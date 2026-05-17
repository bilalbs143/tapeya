<?php

namespace App\Services;

use App\Enums\Event\MatchStatusEnum;
use App\Models\Ball;
use App\Models\Innings;
use App\Models\TournamentMatch;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Assembles the canonical MatchState response consumed by all clients after
 * every ball mutation.  This is the single source of truth for live match
 * state — the app, scorecard viewer, and backoffice all read from here.
 *
 * Call build() AFTER MatchCompletionService::evaluate() so innings/match
 * statuses are already up-to-date in the DB.
 */
class MatchStateService
{
    public function __construct(
        private readonly InningsStatsService $inningsStats,
    ) {}

    /**
     * Build the complete match_state payload for the given match.
     *
     * @param  Innings|null  $scoredInnings  The innings that was just mutated (store/delete).
     *                                       Null for read-only calls (GET match-state).
     *                                       Used to set innings_just_completed (1|2|null) only when
     *                                       the mutated innings just transitioned to 'completed'.
     * @return array<string, mixed>
     */
    public function build(TournamentMatch $match, ?Innings $scoredInnings = null): array
    {
        $match->loadMissing([
            'innings' => fn ($q) => $q->orderBy('innings_number'),
        ]);

        $allInnings = $match->innings;

        /** @var Innings|null $activeInnings First in_progress, else first not completed, else last. */
        $activeInnings = $allInnings->firstWhere('status', 'in_progress') ?? $allInnings->first(fn (Innings $i) => $i->status !== 'completed') ?? $allInnings->last();

        /** @var Innings|null $firstInnings */
        $firstInnings = $allInnings->firstWhere('innings_number', 1);

        $activeInningsData = null;
        $needsNewBatter = false;
        $needsNewBowler = false;
        $activeInningsComplete = false;
        $matchComplete = $match->status === MatchStatusEnum::COMPLETED;

        if ($activeInnings) {
            $match->loadMissing('graphicSession');

            /** @var Collection<int, Ball> $balls */
            $balls = $activeInnings->balls()
                ->with(['striker:id,name', 'nonStriker:id,name', 'bowler:id,name', 'outPlayer:id,name', 'fielder:id,name'])
                ->get();

            $names = InningsStatsService::namesFromRelations($balls);
            $stats = $this->inningsStats->compute($balls, $names);
            $overDetails = InningsStatsService::currentOverDetails($balls);

            $activeInningsComplete = $activeInnings->status === 'completed';

            $lastBall = $balls->last();
            $pending = is_array($match->graphicSession?->pending_players)
                ? $match->graphicSession->pending_players
                : [];

            $activeInningsData = $this->buildActiveInnings(
                match: $match,
                innings: $activeInnings,
                balls: $balls,
                names: $names,
                stats: $stats,
                overDetails: $overDetails,
                firstInnings: $firstInnings,
                inningsComplete: $activeInningsComplete,
                pending: $pending,
            );

            if (! $activeInningsComplete) {
                $needsNewBatter = $lastBall !== null
                    && (bool) $lastBall->is_wicket
                    && ! $lastBall->isRetiredHurt()
                    && ($activeInningsData['striker'] === null || $activeInningsData['non_striker'] === null);
                $needsNewBowler = $overDetails['over_complete'] && empty($pending['next_bowler_id']);
            }
        }

        // Set only on ball mutations when that innings just completed (null on GET).
        $inningsJustCompleted = ($scoredInnings !== null && $scoredInnings->status === 'completed')
            ? (int) $scoredInnings->innings_number
            : null;

        // Playing XI for both teams — avoids 2 separate client round-trips
        $playingElevenRows = DB::table('match_players as mp')
            ->join('users as u', 'u.id', '=', 'mp.user_id')
            ->where('mp.match_id', $match->id)
            ->whereIn('mp.team_id', [$match->home_team_id, $match->away_team_id])
            ->orderBy('mp.id')
            ->get(['mp.user_id', 'mp.team_id', 'mp.playing_role', 'u.name', 'u.nickname']);

        $buildXi = function (int $teamId) use ($playingElevenRows): array {
            $rows = $playingElevenRows->where('team_id', $teamId)->values();

            return [
                'team_id' => $teamId,
                'player_ids' => $rows->pluck('user_id')->map(fn ($id) => (int) $id)->values()->all(),
                'players' => $rows->map(function ($r) {
                    $role = $r->playing_role
                        ? Str::headline(str_replace('_', ' ', $r->playing_role))
                        : 'Player';

                    return [
                        'id' => (int) $r->user_id,
                        'name' => $r->name ?: $r->nickname ?: 'Player',
                        'role' => $role,
                    ];
                })->values()->all(),
            ];
        };

        return [
            'match_id' => $match->id,
            'match_status' => $match->status instanceof MatchStatusEnum
                ? $match->status->value
                : (string) $match->status,
            'active_innings' => $activeInningsData,
            'needs_new_batter' => $needsNewBatter,
            'needs_new_bowler' => $needsNewBowler,
            'innings_just_completed' => $inningsJustCompleted,
            'match_complete' => $matchComplete,
            'match_result' => $matchComplete ? $match->resultSummary() : null,
            'playing_eleven' => [
                'home' => $buildXi((int) $match->home_team_id),
                'away' => $buildXi((int) $match->away_team_id),
            ],
        ];
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    /**
     * @param  Collection<int, Ball>  $balls
     * @param  array<int, string>  $names
     * @param  array<string, mixed>  $stats  Result of InningsStatsService::compute()
     * @param  array<string, mixed>  $overDetails  Result of InningsStatsService::currentOverDetails()
     * @return array<string, mixed>
     */
    private function buildActiveInnings(
        TournamentMatch $match,
        Innings $innings,
        Collection $balls,
        array $names,
        array $stats,
        array $overDetails,
        ?Innings $firstInnings,
        bool $inningsComplete,
        array $pending = [],
    ): array {
        $extras = $stats['extras_breakdown'];
        $batsmenById = $stats['batting_by_id'];
        $bowlerById = $stats['bowling_by_id'];

        $crease = InningsStatsService::resolveCreaseAfterBalls($balls);
        $strikerId = $crease['striker_id'];
        $nonStrikerId = $crease['non_striker_id'];

        // PATCH /crease pending_players: openers (no balls yet), vacant slot after wicket,
        // or next bowler between overs.
        $lastBowlerId = $balls->last()?->bowler_id;

        if ($balls->isEmpty()) {
            if (! empty($pending['next_batter_id'])) {
                $strikerId = (int) $pending['next_batter_id'];
            }
            if (! empty($pending['next_non_striker_id'])) {
                $nonStrikerId = (int) $pending['next_non_striker_id'];
            }
            if (! empty($pending['next_bowler_id'])) {
                $lastBowlerId = (int) $pending['next_bowler_id'];
            }
        } else {
            if ($overDetails['over_complete'] && ! empty($pending['next_bowler_id'])) {
                $lastBowlerId = (int) $pending['next_bowler_id'];
            }
            foreach (['next_batter_id', 'next_non_striker_id'] as $key) {
                if (empty($pending[$key])) {
                    continue;
                }
                $id = (int) $pending[$key];
                if ($id <= 0 || $strikerId === $id || $nonStrikerId === $id) {
                    continue;
                }
                if ($strikerId === null) {
                    $strikerId = $id;
                } elseif ($nonStrikerId === null) {
                    $nonStrikerId = $id;
                }
            }
        }

        // Resolve player names for pending IDs that have no ball history yet.
        // batterSlice / bowlerSlice fall back to an empty stats array, so runs
        // and balls will be 0 — correct for a player who hasn't faced a ball.
        if ($strikerId !== null && ! isset($names[$strikerId])) {
            $names[$strikerId] = DB::table('users')->where('id', $strikerId)->value('name') ?? '';
        }
        if ($nonStrikerId !== null && ! isset($names[$nonStrikerId])) {
            $names[$nonStrikerId] = DB::table('users')->where('id', $nonStrikerId)->value('name') ?? '';
        }
        if ($lastBowlerId !== null && ! isset($names[$lastBowlerId])) {
            $names[$lastBowlerId] = DB::table('users')->where('id', $lastBowlerId)->value('name') ?? '';
        }

        $striker = $this->batterSlice($strikerId, $names, $batsmenById);
        $nonStriker = $this->batterSlice($nonStrikerId, $names, $batsmenById);

        $bowler = $this->bowlerSlice($lastBowlerId, $names, $bowlerById);

        $currentPartnership = $this->currentPartnership($balls);

        // Second-innings target metrics
        $target = null;
        $runsToWin = null;
        $ballsRemaining = null;
        $requiredRunRate = null;

        $isSecondInnings = (int) $innings->innings_number === 2;
        if ($isSecondInnings && $firstInnings?->status === 'completed') {
            $firstRuns = $this->computeInningsRuns($firstInnings);
            $target = $firstRuns + 1;
            $runsToWin = max(0, $target - $stats['total_runs']);
            $oversLimit = max(1, (int) ($match->overs ?: 20));
            $ballsRemaining = max(0, ($oversLimit * 6) - $stats['legal_balls']);
            $requiredRunRate = $ballsRemaining > 0
                ? number_format($runsToWin / ($ballsRemaining / 6), 2)
                : null;
        }

        // Reason why innings ended
        $inningsCompleteReason = null;
        if ($inningsComplete) {
            $pps = max(1, (int) ($match->players_per_side ?: 11));
            $maxWickets = $pps - 1;
            $oversLimit = max(1, (int) ($match->overs ?: 20));

            if ($stats['total_wickets'] >= $maxWickets) {
                $inningsCompleteReason = 'all_out';
            } elseif ($isSecondInnings && isset($firstRuns) && $stats['total_runs'] > $firstRuns) {
                $inningsCompleteReason = 'target_reached';
            } elseif ($stats['legal_balls'] >= $oversLimit * 6) {
                $inningsCompleteReason = 'overs_complete';
            } else {
                // Innings completed via admin action or direct DB write — no statistical reason.
                $inningsCompleteReason = 'manual';
            }
        }

        return [
            'innings_id' => $innings->id,
            'innings_number' => $innings->innings_number,
            'innings_status' => $innings->status,
            'batting_team_id' => $innings->batting_team_id,
            'bowling_team_id' => $innings->bowling_team_id,
            'striker' => $striker,
            'non_striker' => $nonStriker,
            'bowler' => $bowler,
            'total_runs' => $stats['total_runs'],
            'total_wickets' => $stats['total_wickets'],
            'legal_balls' => $stats['legal_balls'],
            'overs_display' => InningsStatsService::oversDisplay($stats['legal_balls']),
            'extras_breakdown' => $extras,
            'over_number' => $overDetails['over_number'],
            'balls_in_current_over' => $overDetails['balls_in_current_over'],
            'over_complete' => $overDetails['over_complete'],
            'current_over_balls' => $overDetails['current_over_balls'],
            'next_is_free_hit' => $overDetails['next_is_free_hit'],
            'current_partnership' => $currentPartnership,
            'innings_complete' => $inningsComplete,
            'innings_complete_reason' => $inningsCompleteReason,
            'target' => $target,
            'runs_to_win' => $runsToWin,
            'balls_remaining' => $ballsRemaining,
            'required_run_rate' => $requiredRunRate,
            'current_run_rate' => InningsStatsService::runRate($stats['total_runs'], $stats['legal_balls']),
        ];
    }

    /**
     * Build a compact batter stats slice for the match_state response.
     *
     * @param  array<int, array>  $batsmenById
     * @param  array<int, string>  $names
     * @return array<string, mixed>|null
     */
    private function batterSlice(?int $id, array $names, array $batsmenById): ?array
    {
        if ($id === null) {
            return null;
        }
        $s = $batsmenById[$id] ?? [];

        return [
            'id' => $id,
            'name' => $names[$id] ?? '',
            'runs' => $s['runs'] ?? 0,
            'balls' => $s['balls'] ?? 0,
            'fours' => $s['fours'] ?? 0,
            'sixes' => $s['sixes'] ?? 0,
        ];
    }

    /**
     * Build a compact bowler stats slice for the match_state response.
     *
     * @param  array<int, array>  $bowlerById
     * @param  array<int, string>  $names
     * @return array<string, mixed>|null
     */
    private function bowlerSlice(?int $id, array $names, array $bowlerById): ?array
    {
        if ($id === null) {
            return null;
        }
        $s = $bowlerById[$id] ?? [];
        $balls = (int) ($s['balls'] ?? 0);

        return [
            'id' => $id,
            'name' => $names[$id] ?? '',
            'overs' => InningsStatsService::oversDisplay($balls),
            'maidens' => $s['maidens'] ?? 0,
            'runs' => $s['runs'] ?? 0,
            'wickets' => $s['wickets'] ?? 0,
        ];
    }

    /**
     * Compute runs and balls for the current (most recent) batting partnership.
     *
     * @param  Collection<int, Ball>  $balls
     * @return array{runs: int, balls: int}
     */
    private function currentPartnership(Collection $balls): array
    {
        $runs = 0;
        $ballCount = 0;

        foreach ($balls as $ball) {
            $runs += (int) ($ball->runs ?? 0);
            $ballCount++;

            if ($ball->is_wicket && $ball->out_player_id) {
                $runs = 0;
                $ballCount = 0;
            }
        }

        return ['runs' => $runs, 'balls' => $ballCount];
    }

    /**
     * Sum total runs for a completed innings (used for 2nd-innings target).
     */
    private function computeInningsRuns(Innings $innings): int
    {
        return (int) $innings->balls()
            ->reorder()
            ->selectRaw('SUM(COALESCE(runs,0) + COALESCE(penalty_runs,0)) as total')
            ->value('total');
    }
}
