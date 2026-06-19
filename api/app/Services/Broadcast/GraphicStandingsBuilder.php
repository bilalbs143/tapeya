<?php

namespace App\Services\Broadcast;

use App\Models\TournamentMatch;
use App\Services\TournamentStandingsService;

/**
 * Tournament standings slice for the graphic overlay `context` blob.
 */
final class GraphicStandingsBuilder
{
    public function __construct(
        private readonly TournamentStandingsService $standings,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function standingsFragment(TournamentMatch $match): array
    {
        $rows = $this->standings->computeForMatch($match);

        return [
            'standings' => array_map(
                static fn (array $row, int $index) => [
                    'rank' => $index + 1,
                    'team_id' => $row['team_id'],
                    'team_name' => $row['team_name'],
                    'played' => $row['played'],
                    'won' => $row['won'],
                    'lost' => $row['lost'],
                    'no_result' => $row['no_result'],
                    'tied' => $row['tied'],
                    'points' => $row['points'],
                    'nrr' => $row['nrr'],
                ],
                $rows,
                array_keys($rows),
            ),
        ];
    }
}
