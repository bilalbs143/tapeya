<?php

namespace App\Services;

use App\Enums\Common\StatusEnum;
use App\Enums\Tournament\TournamentRequestStatusEnum;
use App\Http\Controllers\Admin\Concerns\EnsuresTournamentStaffAppRoles;
use App\Models\Tournament;
use App\Models\TournamentRequest;
use Illuminate\Support\Facades\DB;

class LeagueTournamentRequestProvisioner
{
    use EnsuresTournamentStaffAppRoles;

    /**
     * Auto-approve the request, create the tournament row, and grant the submitter the Organizer app role.
     *
     * @param  array<string, mixed>  $validated  Validated tournament-request payload (includes user_id, number_of_groups).
     * @return array{0: TournamentRequest, 1: Tournament}
     */
    public function approveAndCreateTournament(array $validated, int $userId): array
    {
        return DB::transaction(function () use ($validated, $userId) {
            $validated['user_id'] = $userId;
            $validated['status'] = TournamentRequestStatusEnum::APPROVED;

            $tournamentRequest = TournamentRequest::create($validated);

            $groups = max(1, min(16, (int) ($tournamentRequest->number_of_groups ?? 1)));

            $tournament = Tournament::create([
                'organizer_id' => $userId,
                'created_by' => $userId,
                'tournament_name' => $tournamentRequest->tournament_name,
                'tournament_type' => $tournamentRequest->tournament_type,
                'cricket_format' => $tournamentRequest->cricket_format,
                'venue_name' => $tournamentRequest->venue_name,
                'start_date' => $tournamentRequest->start_date,
                'end_date' => $tournamentRequest->end_date,
                'number_of_teams' => $tournamentRequest->number_of_teams,
                'number_of_groups' => $groups,
                'country' => $tournamentRequest->country,
                'city' => $tournamentRequest->city,
                'match_timings' => $tournamentRequest->match_timings,
                'status' => StatusEnum::ACTIVE,
                'prize' => $tournamentRequest->prize,
            ]);

            $this->ensureOrganizerRole($userId);

            return [$tournamentRequest, $tournament];
        });
    }
}
