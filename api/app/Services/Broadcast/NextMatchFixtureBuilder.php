<?php

namespace App\Services\Broadcast;

use App\Models\TournamentMatch;
use App\Support\Media\MediaDisk;

/**
 * Resolves the next scheduled fixture in the same tournament for NEXT_MATCH graphics.
 */
final class NextMatchFixtureBuilder
{
    /**
     * @return array<string, mixed>|null
     */
    public function buildForMatch(TournamentMatch $match): ?array
    {
        $tournamentId = (int) ($match->tournament_id ?? 0);
        if ($tournamentId <= 0) {
            return null;
        }

        $currentIndex = (int) ($match->group_index ?? $match->id);

        $next = TournamentMatch::query()
            ->where('tournament_id', $tournamentId)
            ->where('id', '!=', $match->id)
            ->where(function ($q) use ($currentIndex, $match) {
                $q->where('group_index', '>', $currentIndex);
                if ($match->match_date !== null) {
                    $q->orWhere(function ($q2) use ($match, $currentIndex) {
                        $q2->where('match_date', '>', $match->match_date)
                            ->where(function ($q3) use ($currentIndex) {
                                $q3->whereNull('group_index')
                                    ->orWhere('group_index', '<=', $currentIndex);
                            });
                    });
                }
            })
            ->orderBy('group_index')
            ->orderBy('match_date')
            ->orderBy('id')
            ->with(['homeTeam', 'awayTeam', 'tournament'])
            ->first();

        if ($next === null) {
            return null;
        }

        $logoUrl = static fn (?string $path): ?string => MediaDisk::url($path);

        $venue = trim((string) ($next->venue_name ?? $next->tournament?->venue_name ?? ''));
        $venueLine = $venue !== '' ? 'LIVE FROM '.$venue : '';

        return [
            'match_number' => (int) ($next->group_index ?? $next->id),
            'venue_name' => $venue,
            'venue_display_line' => $venueLine,
            'home_team' => [
                'id' => (int) $next->home_team_id,
                'display_name' => $next->homeTeam?->name ?? '',
                'short_code' => $next->homeTeam?->code ?? '',
                'logo_url' => $logoUrl($next->homeTeam?->logo),
            ],
            'away_team' => [
                'id' => (int) $next->away_team_id,
                'display_name' => $next->awayTeam?->name ?? '',
                'short_code' => $next->awayTeam?->code ?? '',
                'logo_url' => $logoUrl($next->awayTeam?->logo),
            ],
        ];
    }
}
