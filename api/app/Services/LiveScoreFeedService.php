<?php

namespace App\Services;

use App\Enums\Event\InningsStatusEnum;
use App\Enums\Event\MatchStatusEnum;
use App\Enums\Tournament\TournamentTypeEnum;
use App\Models\Innings;
use App\Models\TournamentMatch;
use App\Support\Media\MediaDisk;
use Illuminate\Support\Collection;

/**
 * Compact live cricket scores for the consumer Home slider.
 *
 * Reuses InningsStatsService (same totals as MatchState / scorecard) without
 * exposing staff-only match-state or full scorecard endpoints.
 */
class LiveScoreFeedService
{
    public const DEFAULT_LIMIT = 10;

    /** Drop abandoned in_progress matches that have had no scoring activity for this long. */
    public const MAX_STALE_HOURS = 24;

    public function __construct(
        private readonly InningsStatsService $inningsStats,
    ) {}

    /**
     * @return list<array<string, mixed>>
     */
    public function list(int $limit = self::DEFAULT_LIMIT): array
    {
        $limit = max(1, min($limit, 20));

        $matches = TournamentMatch::query()
            ->where('status', MatchStatusEnum::IN_PROGRESS)
            ->where('updated_at', '>=', now()->subHours(self::MAX_STALE_HOURS))
            ->whereHas(
                'tournament',
                fn ($q) => $q->where('tournament_type', TournamentTypeEnum::OPEN_TOURNAMENT),
            )
            ->with([
                'homeTeam:id,name,logo',
                'awayTeam:id,name,logo',
                'tournament:id,tournament_name,short_name,tournament_type',
                'innings' => fn ($q) => $q->orderBy('innings_number'),
                'innings.balls' => fn ($q) => $q
                    ->orderBy('over')
                    ->orderBy('ball_in_over')
                    ->orderBy('id'),
            ])
            ->orderByDesc('updated_at')
            ->orderByDesc('id')
            ->limit($limit)
            ->get();

        return $matches
            ->map(fn (TournamentMatch $match) => $this->summarise($match))
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    public function summarise(TournamentMatch $match): array
    {
        $match->loadMissing([
            'homeTeam:id,name,logo',
            'awayTeam:id,name,logo',
            'tournament:id,tournament_name,short_name,tournament_type',
            'innings' => fn ($q) => $q->orderBy('innings_number'),
            'innings.balls' => fn ($q) => $q
                ->orderBy('over')
                ->orderBy('ball_in_over')
                ->orderBy('id'),
        ]);

        /** @var Collection<int, Innings> $innings */
        $innings = $match->innings;
        $inningsPayload = [];
        $firstInningsRuns = null;
        $active = null;

        foreach ($innings as $inningsRow) {
            $summary = $this->summariseInnings($match, $inningsRow);
            $inningsPayload[] = $summary;

            if ((int) $inningsRow->innings_number === 1
                && $inningsRow->status === InningsStatusEnum::COMPLETED) {
                $firstInningsRuns = (int) $summary['total_runs'];
            }

            if ($inningsRow->status === InningsStatusEnum::IN_PROGRESS) {
                $active = $summary;
            }
        }

        if ($active === null) {
            $active = collect($inningsPayload)->last();
        }

        $target = null;
        $runsToWin = null;
        $ballsRemaining = null;

        if ($active !== null
            && (int) $active['innings_number'] === 2
            && $firstInningsRuns !== null) {
            $target = $match->chaseTargetForSecondInnings($firstInningsRuns);
            $runsToWin = max(0, (int) $target - (int) $active['total_runs']);
            $oversLimit = max(1, (int) ($match->overs ?: 20));
            $ballsRemaining = max(0, ($oversLimit * 6) - (int) $active['legal_balls']);

            $active['target'] = $target;
            $active['runs_to_win'] = $runsToWin;
            $active['balls_remaining'] = $ballsRemaining;
        }

        $summary = $match->tournamentSummary();
        $shortName = 'Match';
        if ($summary !== null) {
            $shortName = $summary['short_name'] !== ''
                ? $summary['short_name']
                : ($summary['name'] !== '' ? $summary['name'] : 'Match');
        }

        return [
            'id' => (int) $match->id,
            'tournament_id' => (int) $match->tournament_id,
            'status' => $match->status instanceof MatchStatusEnum
                ? $match->status->value
                : (string) $match->status,
            'match_label' => $shortName,
            'overs_limit' => (int) ($match->overs ?: 20),
            'home_team' => $this->teamSlice($match->homeTeam),
            'away_team' => $this->teamSlice($match->awayTeam),
            'tournament' => $summary === null
                ? ['id' => null, 'name' => '', 'short_name' => '']
                : [
                    'id' => $summary['id'],
                    'name' => $summary['name'],
                    'short_name' => $summary['short_name'],
                ],
            'innings' => $inningsPayload,
            'active_innings' => $active,
            'commentary' => $this->commentary(
                active: $active,
                battingTeamName: $this->teamNameForId($match, $active['batting_team_id'] ?? null),
                runsToWin: $runsToWin,
                ballsRemaining: $ballsRemaining,
            ),
            'updated_at' => $match->updated_at?->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function summariseInnings(TournamentMatch $match, Innings $innings): array
    {
        $balls = $innings->balls;
        $names = InningsStatsService::namesFromRelations($balls);
        $stats = $this->inningsStats->compute($balls, $names);
        $crossPenalty = InningsStatsService::crossInningsPenaltyRunsForBattingTeam(
            $match,
            (int) $innings->batting_team_id,
        );
        $stats = InningsStatsService::applyCrossInningsPenalties($stats, $crossPenalty);

        return [
            'innings_number' => (int) $innings->innings_number,
            'innings_status' => $innings->status instanceof InningsStatusEnum
                ? $innings->status->value
                : (string) $innings->status,
            'batting_team_id' => (int) $innings->batting_team_id,
            'bowling_team_id' => (int) $innings->bowling_team_id,
            'total_runs' => (int) $stats['total_runs'],
            'total_wickets' => (int) $stats['total_wickets'],
            'legal_balls' => (int) $stats['legal_balls'],
            'overs_display' => InningsStatsService::oversDisplay((int) $stats['legal_balls']),
            'current_run_rate' => InningsStatsService::runRate(
                (int) $stats['total_runs'],
                (int) $stats['legal_balls'],
            ),
            'target' => null,
            'runs_to_win' => null,
            'balls_remaining' => null,
        ];
    }

    /**
     * @return array{id: int|null, name: string, logo: string|null}|null
     */
    private function teamSlice(mixed $team): ?array
    {
        if ($team === null) {
            return null;
        }

        return [
            'id' => (int) $team->id,
            'name' => (string) ($team->name ?: 'Team'),
            'logo' => MediaDisk::url($team->logo),
        ];
    }

    private function teamNameForId(TournamentMatch $match, mixed $teamId): ?string
    {
        if ($teamId === null) {
            return null;
        }

        $id = (int) $teamId;
        if ($match->home_team_id !== null && (int) $match->home_team_id === $id) {
            return $match->homeTeam?->name;
        }
        if ($match->away_team_id !== null && (int) $match->away_team_id === $id) {
            return $match->awayTeam?->name;
        }

        return null;
    }

    /**
     * @param  array<string, mixed>|null  $active
     */
    private function commentary(
        ?array $active,
        ?string $battingTeamName,
        ?int $runsToWin,
        ?int $ballsRemaining,
    ): ?string {
        if ($active !== null && (int) ($active['innings_number'] ?? 0) === 1) {
            return 'Current run rate: '.($active['current_run_rate'] ?? '0.00').'.';
        }

        if ($battingTeamName === null || $runsToWin === null || $ballsRemaining === null) {
            return null;
        }

        if ($ballsRemaining <= 0) {
            return "{$battingTeamName} need {$runsToWin} runs.";
        }

        if ($ballsRemaining % 6 === 0) {
            $overs = intdiv($ballsRemaining, 6);

            return "{$battingTeamName} need {$runsToWin} runs from {$overs} overs.";
        }

        return "{$battingTeamName} need {$runsToWin} runs from {$ballsRemaining} balls.";
    }
}
