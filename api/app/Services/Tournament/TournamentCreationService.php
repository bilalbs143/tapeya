<?php

namespace App\Services\Tournament;

use App\Enums\Common\StatusEnum;
use App\Enums\Tournament\TournamentTypeEnum;
use App\Models\Tournament;
use App\Models\User;

/**
 * Creates tournaments with sensible defaults for simplified app onboarding.
 */
final class TournamentCreationService
{
    /**
     * @param  array<string, mixed>  $input
     */
    public function createForUser(User $user, array $input): Tournament
    {
        $today = now()->startOfDay();
        $type = TournamentTypeEnum::tryFrom((string) ($input['tournament_type'] ?? ''))
            ?? TournamentTypeEnum::OPEN_TOURNAMENT;

        return Tournament::query()->create([
            'organizer_id' => $user->id,
            'created_by' => $user->id,
            'tournament_name' => $input['tournament_name'],
            'short_name' => $input['short_name'] ?? null,
            'tournament_type' => $type,
            'venue_name' => $input['venue_name'] ?? 'TBD',
            'start_date' => $input['start_date'] ?? $today->toDateString(),
            'end_date' => $input['end_date'] ?? $today->copy()->addDays(30)->toDateString(),
            'number_of_teams' => (int) ($input['number_of_teams'] ?? 8),
            'number_of_groups' => (int) ($input['number_of_groups'] ?? 1),
            'country' => $input['country'] ?? null,
            'city' => $input['city'],
            'status' => StatusEnum::ACTIVE,
            'prize' => $input['prize'] ?? null,
        ]);
    }

    /**
     * @param  array<string, mixed>  $input
     */
    public function applyAdminDefaults(array $input): array
    {
        $today = now()->startOfDay();

        $input['venue_name'] = $input['venue_name'] ?? 'TBD';
        $input['start_date'] = $input['start_date'] ?? $today->toDateString();
        $input['end_date'] = $input['end_date'] ?? $today->copy()->addDays(30)->toDateString();
        $input['number_of_groups'] = $input['number_of_groups'] ?? 1;
        $input['tournament_type'] = $input['tournament_type']
            ?? TournamentTypeEnum::OPEN_TOURNAMENT->value;

        return $input;
    }
}
