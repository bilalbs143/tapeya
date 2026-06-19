<?php

namespace App\Services;

use App\Enums\Event\InningsEndReasonEnum;
use App\Enums\Event\InningsStatusEnum;
use App\Enums\Event\MatchStatusEnum;
use App\Models\Ball;
use App\Models\Innings;
use App\Models\TournamentMatch;
use App\Support\Scoring\MatchPendingState;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
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
        $activeInnings = $allInnings->firstWhere('status', InningsStatusEnum::IN_PROGRESS) ?? $allInnings->first(fn (Innings $i) => $i->status !== InningsStatusEnum::COMPLETED) ?? $allInnings->last();

        /** @var Innings|null $firstInnings */
        $firstInnings = $allInnings->firstWhere('innings_number', 1);

        $activeInningsData = null;
        $needsNewBatter = false;
        $needsNewBowler = false;
        $lastDismissalBallId = null;
        $vacantEnd = null;
        $activeInningsComplete = false;
        $matchComplete = in_array($match->status, [MatchStatusEnum::COMPLETED, MatchStatusEnum::CANCELLED], true);

        if ($activeInnings) {
            $match->loadMissing('graphicSession');

            /** @var Collection<int, Ball> $balls */
            $balls = $activeInnings->balls()
                ->with(['striker:id,name', 'nonStriker:id,name', 'bowler:id,name', 'outPlayer:id,name', 'fielder:id,name'])
                ->get();

            $names = InningsStatsService::namesFromRelations($balls);
            $stats = $this->inningsStats->compute($balls, $names);
            $crossPenalty = InningsStatsService::crossInningsPenaltyRunsForBattingTeam(
                $match,
                (int) $activeInnings->batting_team_id,
            );
            $stats = InningsStatsService::applyCrossInningsPenalties($stats, $crossPenalty);
            $overDetails = InningsStatsService::currentOverDetails($balls);

            $activeInningsComplete = $activeInnings->status === InningsStatusEnum::COMPLETED;

            $lastBall = $balls->last();
            $pending = MatchPendingState::resolve($match);

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
                // A new bowler is needed only when the last delivery actually ended an over —
                // i.e. it was a legal ball AND legal_balls is a multiple of 6.
                // Using over_complete alone is wrong: that flag stays true after a Wide/NB
                // opens the new over, falsely re-triggering the picker.
                //
                // Exception: when the over ends on a countable wicket, do NOT prompt for a
                // new bowler — the same bowler continues by default for the next over, and
                // the scorer can change them manually via Add/Replace Bowler if needed.
                // (Retired hurt on ball 6 is excluded: it is not a crease-vacating wicket,
                // so the over ends normally and a bowler change prompt is still appropriate.)
                $overEndedOnWicket = $lastBall !== null
                    && (bool) $lastBall->is_wicket
                    && ! $lastBall->isRetiredHurt();

                $needsNewBowler = $lastBall !== null
                    && $lastBall->isLegalDelivery()
                    && ($stats['legal_balls'] % 6 === 0)
                    && empty($pending['next_bowler_id'])
                    && ! $overEndedOnWicket;

                if ($lastBall !== null && (bool) $lastBall->is_wicket && ! $lastBall->isRetiredHurt()) {
                    $lastDismissalBallId = (int) $lastBall->id;
                    if ($activeInningsData['striker'] === null) {
                        $vacantEnd = 'striker';
                    } elseif ($activeInningsData['non_striker'] === null) {
                        $vacantEnd = 'non_striker';
                    }
                }
            }
        }

        // Set only on ball mutations when that innings just completed (null on GET).
        $inningsJustCompleted = ($scoredInnings !== null && $scoredInnings->status === InningsStatusEnum::COMPLETED)
            ? (int) $scoredInnings->innings_number
            : null;

        // S10: Playing XI is cached for 60 s — it changes rarely mid-match (only on
        // PlayingElevenController::store() which dispatches MatchStateUpdated and
        // overwrites the cache key via PlayingElevenController's broadcast).
        $playingElevenRows = Cache::remember(
            "match:{$match->id}:playing_eleven",
            60,
            fn () => DB::table('match_players as mp')
                ->join('users as u', 'u.id', '=', 'mp.user_id')
                ->where('mp.match_id', $match->id)
                ->whereIn('mp.team_id', [$match->home_team_id, $match->away_team_id])
                ->orderBy('mp.id')
                ->get(['mp.user_id', 'mp.team_id', 'mp.playing_role', 'u.name', 'u.nickname']),
        );

        $teamSettingsRows = DB::table('match_team_settings')
            ->where('match_id', $match->id)
            ->whereIn('team_id', [$match->home_team_id, $match->away_team_id])
            ->get(['team_id', 'wicket_keeper_id', 'captain_id'])
            ->keyBy('team_id');

        $buildXi = function (int $teamId) use ($playingElevenRows, $teamSettingsRows): array {
            $rows = $playingElevenRows->where('team_id', $teamId)->values();
            $settings = $teamSettingsRows->get($teamId);

            return [
                'team_id' => $teamId,
                'player_ids' => $rows->pluck('user_id')->map(fn ($id) => (int) $id)->values()->all(),
                'captain_id' => $settings?->captain_id !== null ? (int) $settings->captain_id : null,
                'wicket_keeper_id' => $settings?->wicket_keeper_id !== null ? (int) $settings->wicket_keeper_id : null,
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
            'last_dismissal_ball_id' => $lastDismissalBallId,
            'vacant_end' => $vacantEnd,
            'innings_just_completed' => $inningsJustCompleted,
            'match_complete' => $matchComplete,
            'match_result' => $matchComplete ? $match->resultSummary() : null,
            'match_cancelled' => $match->status === MatchStatusEnum::CANCELLED,
            'playing_eleven' => [
                'home' => $buildXi((int) $match->home_team_id),
                'away' => $buildXi((int) $match->away_team_id),
            ],
            'analytics_settings' => $match->analyticsSettings(),
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
        $dismissedIds = InningsStatsService::dismissedPlayerIdsFromBalls($balls);

        // PATCH /crease pending_crease: openers (no balls yet), vacant slot after wicket,
        // or next bowler between overs.
        $lastBowlerId = $balls->last()?->bowler_id;

        if ($balls->isEmpty()) {
            $merged = InningsStatsService::applyPendingCreaseSelection($strikerId, $nonStrikerId, $pending, false, $dismissedIds);
            $strikerId = $merged['striker_id'];
            $nonStrikerId = $merged['non_striker_id'];
            if (! empty($pending['next_bowler_id'])) {
                $lastBowlerId = (int) $pending['next_bowler_id'];
            }
        } else {
            if ($overDetails['over_complete'] && ! empty($pending['next_bowler_id'])) {
                $lastBowlerId = (int) $pending['next_bowler_id'];
            }
            $merged = InningsStatsService::applyPendingCreaseSelection($strikerId, $nonStrikerId, $pending, true, $dismissedIds);
            $strikerId = $merged['striker_id'];
            $nonStrikerId = $merged['non_striker_id'];
        }

        if (! empty($pending['substitute_replaced_id']) && ! empty($pending['substitute_player_id'])) {
            $replaced = (int) $pending['substitute_replaced_id'];
            $sub = (int) $pending['substitute_player_id'];
            if ($strikerId === $replaced) {
                $strikerId = $sub;
            } elseif ($nonStrikerId === $replaced) {
                $nonStrikerId = $sub;
            }
        }

        // S9: Resolve player names for pending IDs that have no ball history yet.
        // Batch into a single whereIn query instead of 3 separate selects.
        $missingIds = array_values(array_filter(
            array_unique([$strikerId, $nonStrikerId, $lastBowlerId]),
            fn (?int $id) => $id !== null && ! isset($names[$id]),
        ));
        if ($missingIds !== []) {
            DB::table('users')
                ->whereIn('id', $missingIds)
                ->get(['id', 'name'])
                ->each(function ($u) use (&$names) {
                    $names[(int) $u->id] = $u->name ?? '';
                });
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
        if ($isSecondInnings && $firstInnings?->status === InningsStatusEnum::COMPLETED) {
            $firstRuns = $this->computeInningsRuns($match, $firstInnings);
            $target = $match->chaseTargetForSecondInnings($firstRuns);
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
            $storedReason = $innings->end_reason
                ? InningsEndReasonEnum::tryFrom($innings->end_reason)
                : null;

            if ($storedReason !== null) {
                $inningsCompleteReason = $storedReason->matchStateReason();
            } else {
                $pps = max(1, (int) ($match->players_per_side ?: 11));
                $maxWickets = $pps - 1;
                $oversLimit = max(1, (int) ($match->overs ?: 20));

                if ($stats['total_wickets'] >= $maxWickets) {
                    $inningsCompleteReason = 'all_out';
                } elseif ($isSecondInnings && isset($firstRuns)) {
                    $chaseTarget = $match->chaseTargetForSecondInnings($firstRuns);
                    if ($chaseTarget !== null && $stats['total_runs'] >= $chaseTarget) {
                        $inningsCompleteReason = 'target_reached';
                    } elseif ($stats['legal_balls'] >= $oversLimit * 6) {
                        $inningsCompleteReason = 'overs_complete';
                    } else {
                        $inningsCompleteReason = 'manual';
                    }
                } elseif ($stats['legal_balls'] >= $oversLimit * 6) {
                    $inningsCompleteReason = 'overs_complete';
                } else {
                    $inningsCompleteReason = 'manual';
                }
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
            'current_over_deliveries' => $overDetails['current_over_deliveries'],
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
            if ($ball->isLegalDelivery()) {
                $ballCount++;
            }

            // S3: retired_hurt is stored with is_wicket=true but does NOT end a partnership
            // — the batter may return. Only genuine wickets reset the counter.
            if ($ball->is_wicket && $ball->out_player_id && ! $ball->isRetiredHurt()) {
                $runs = 0;
                $ballCount = 0;
            }
        }

        return ['runs' => $runs, 'balls' => $ballCount];
    }

    /**
     * Sum total runs for a completed innings (used for 2nd-innings target).
     *
     * S17: Uses loadMissing('balls') so the query is skipped if balls are already
     * loaded on the innings model, avoiding a redundant DB round-trip.
     */
    private function computeInningsRuns(TournamentMatch $match, Innings $innings): int
    {
        $innings->loadMissing('balls');
        $balls = $innings->balls;
        $stats = $this->inningsStats->compute($balls, InningsStatsService::namesFromRelations($balls));
        $cross = InningsStatsService::crossInningsPenaltyRunsForBattingTeam($match, (int) $innings->batting_team_id);

        return (int) InningsStatsService::applyCrossInningsPenalties($stats, $cross)['total_runs'];
    }
}
