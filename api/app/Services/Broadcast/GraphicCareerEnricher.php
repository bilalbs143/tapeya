<?php

namespace App\Services\Broadcast;

use App\Enums\Broadcast\GraphicCommandKeyEnum;
use App\Models\TournamentMatch;
use App\Services\PlayerStatsService;

/**
 * Fills match graphic command payloads with tournament-scoped player stats for
 * `BATSMAN_TOURNAMENT_*` / `BOWLER_TOURNAMENT_*` commands when a live match is
 * available; falls back to all-time career totals otherwise.
 */
final class GraphicCareerEnricher
{
    public function __construct(
        private readonly PlayerStatsService $stats,
    ) {}

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function enrichForCommandKey(array $payload, GraphicCommandKeyEnum $key, ?TournamentMatch $match = null): array
    {
        if (! empty($payload['stats']) && is_array($payload['stats'])) {
            return $payload;
        }

        $playerId = (int) ($payload['user_id'] ?? 0);
        if ($playerId <= 0) {
            return $payload;
        }

        return match ($key) {
            GraphicCommandKeyEnum::BATSMAN_TOURNAMENT_LT => $this->withBattingTournament($payload, $playerId, $match, includeAverage: false),
            GraphicCommandKeyEnum::BATSMAN_TOURNAMENT_FS => $this->withBattingTournament($payload, $playerId, $match, includeAverage: true),
            GraphicCommandKeyEnum::BOWLER_TOURNAMENT_LT,
            GraphicCommandKeyEnum::BOWLER_TOURNAMENT_FS => $this->withBowlingTournament($payload, $playerId, $match),
            default => $payload,
        };
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function withBattingTournament(array $payload, int $playerId, ?TournamentMatch $match, bool $includeAverage): array
    {
        $b = $this->resolveBattingStats($playerId, $match);

        $tournamentBatting = [
            'matches' => $b['matches'],
            'runs' => $b['runs'],
            'fours' => $b['fours'],
            'sixes' => $b['sixes'],
            'fifties' => $b['fifties'],
            'hundreds' => $b['hundreds'],
            'strike_rate' => $b['strike_rate'],
        ];
        if ($includeAverage) {
            $tournamentBatting['average'] = $b['average'];
        }
        $payload['tournament_batting'] = $tournamentBatting;

        $stats = [
            ['label' => 'Matches', 'value' => $b['matches']],
            ['label' => 'Runs', 'value' => $b['runs']],
            ['label' => '4s', 'value' => $b['fours']],
            ['label' => '6s', 'value' => $b['sixes']],
            ['label' => '50s', 'value' => $b['fifties']],
            ['label' => '100s', 'value' => $b['hundreds']],
            ['label' => 'SR', 'value' => $this->fmtOrDash($b['strike_rate'] ?? null)],
        ];
        if ($includeAverage) {
            $stats[] = ['label' => 'Avg', 'value' => $this->fmtOrDash($b['average'] ?? null)];
        }
        $payload['stats'] = $stats;
        $payload['headline'] = 'Tournament Career';

        return $payload;
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function withBowlingTournament(array $payload, int $playerId, ?TournamentMatch $match): array
    {
        $bow = $this->resolveBowlingStats($playerId, $match);

        $payload['tournament_bowling'] = [
            'matches' => $bow['matches'],
            'overs' => $bow['overs'],
            'runs_conceded' => $bow['runs_conceded'],
            'wickets' => $bow['wickets'],
            'average' => $bow['average'],
            'economy' => $bow['economy'],
        ];

        $payload['stats'] = [
            ['label' => 'Matches', 'value' => $bow['matches']],
            ['label' => 'Overs', 'value' => $bow['overs']],
            ['label' => 'Wkts', 'value' => $bow['wickets']],
            ['label' => 'Runs', 'value' => $bow['runs_conceded']],
            ['label' => 'Avg', 'value' => $this->fmtOrDash($bow['average'] ?? null)],
            ['label' => 'Econ', 'value' => $this->fmtOrDash($bow['economy'] ?? null)],
        ];
        $payload['headline'] = 'Tournament Career';

        return $payload;
    }

    /**
     * @return array<string, mixed>
     */
    private function resolveBattingStats(int $playerId, ?TournamentMatch $match): array
    {
        $tournamentId = (int) ($match?->tournament_id ?? 0);
        if ($tournamentId > 0) {
            return $this->stats->battingForPlayerInTournament($playerId, $tournamentId);
        }

        return $this->stats->battingForPlayer($playerId, 'all');
    }

    /**
     * @return array<string, mixed>
     */
    private function resolveBowlingStats(int $playerId, ?TournamentMatch $match): array
    {
        $tournamentId = (int) ($match?->tournament_id ?? 0);
        if ($tournamentId > 0) {
            return $this->stats->bowlingForPlayerInTournament($playerId, $tournamentId);
        }

        return $this->stats->bowlingForPlayer($playerId, 'all');
    }

    private function fmtOrDash(mixed $v): string|float|int
    {
        if ($v === null || $v === '') {
            return '—';
        }
        if (is_numeric($v)) {
            return round((float) $v, 2);
        }

        return '—';
    }
}
