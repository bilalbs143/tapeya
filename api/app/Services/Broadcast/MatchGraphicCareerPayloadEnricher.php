<?php

namespace App\Services\Broadcast;

use App\Enums\Broadcast\GraphicCommandKeyEnum;
use App\Services\PlayerStatsService;

/**
 * Fills match graphic command payloads with `stats` + default headline for tournament
 * player lower-thirds so overlays show **career (all-time)** totals via
 * {@see PlayerStatsService::battingForPlayer} / {@see PlayerStatsService::bowlingForPlayer}
 * with scope `'all'`.
 */
final class MatchGraphicCareerPayloadEnricher
{
    public function __construct(
        private readonly PlayerStatsService $stats,
    ) {}

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function enrichForCommandKey(array $payload, GraphicCommandKeyEnum $key): array
    {
        if (! empty($payload['stats']) && is_array($payload['stats'])) {
            return $payload;
        }

        $playerId = (int) ($payload['user_id'] ?? 0);
        if ($playerId <= 0) {
            return $payload;
        }

        return match ($key) {
            GraphicCommandKeyEnum::BATSMAN_TOURNAMENT_LT,
            GraphicCommandKeyEnum::BATSMAN_TOURNAMENT_FS => $this->withBattingCareer($payload, $playerId),
            GraphicCommandKeyEnum::BOWLER_TOURNAMENT_LT,
            GraphicCommandKeyEnum::BOWLER_TOURNAMENT_FS => $this->withBowlingCareer($payload, $playerId),
            default => $payload,
        };
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function withBattingCareer(array $payload, int $playerId): array
    {
        $b = $this->stats->battingForPlayer($playerId, 'all');
        $payload['stats'] = [
            ['label' => 'Matches', 'value' => $b['matches']],
            ['label' => 'Inns', 'value' => $b['innings']],
            ['label' => 'Runs', 'value' => $b['runs']],
            ['label' => 'BF', 'value' => $b['balls_faced']],
            ['label' => '4s', 'value' => $b['fours']],
            ['label' => '6s', 'value' => $b['sixes']],
            ['label' => '50s', 'value' => $b['fifties']],
            ['label' => '100s', 'value' => $b['hundreds']],
            ['label' => 'HS', 'value' => $b['highest_score']],
            ['label' => 'Avg', 'value' => $this->fmtOrDash($b['average'] ?? null)],
            ['label' => 'SR', 'value' => $this->fmtOrDash($b['strike_rate'] ?? null)],
        ];

        return $this->withHeadline($payload);
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function withBowlingCareer(array $payload, int $playerId): array
    {
        $bow = $this->stats->bowlingForPlayer($playerId, 'all');
        $payload['stats'] = [
            ['label' => 'Matches', 'value' => $bow['matches']],
            ['label' => 'Inns', 'value' => $bow['innings']],
            ['label' => 'Wkts', 'value' => $bow['wickets']],
            ['label' => 'Overs', 'value' => $bow['overs']],
            ['label' => 'Runs', 'value' => $bow['runs_conceded']],
            ['label' => 'Mdns', 'value' => $bow['maidens']],
            ['label' => 'Avg', 'value' => $this->fmtOrDash($bow['average'] ?? null)],
            ['label' => 'Econ', 'value' => $this->fmtOrDash($bow['economy'] ?? null)],
            ['label' => 'Best', 'value' => $bow['best_bowling_innings']],
        ];

        return $this->withHeadline($payload);
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function withHeadline(array $payload): array
    {
        $payload['headline'] = $payload['headline'] ?? 'Career';

        return $payload;
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
