<?php

namespace Tests\Support\Streaming;

use App\Models\Team;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Models\User;

/**
 * Minimal tournament + teams + match for streaming tests that only need a valid match_id.
 */
trait CreatesTestMatch
{
    protected function createMatch(): TournamentMatch
    {
        $organizer = User::factory()->create(['type' => 'user']);

        $tournament = Tournament::create([
            'organizer_id' => $organizer->id,
            'tournament_name' => 'Test Cup',
            'tournament_type' => 'league',
            'cricket_format' => 'tape_ball',
            'venue_name' => 'Test Ground',
            'start_date' => now()->toDateString(),
            'end_date' => now()->toDateString(),
            'number_of_teams' => 2,
            'city' => 'Test City',
            'match_timings' => 'day',
        ]);

        $teamA = Team::create([
            'name' => 'Team A',
            'code' => 'TEA'.uniqid(),
            'user_id' => $organizer->id,
            'created_by' => $organizer->id,
        ]);

        $teamB = Team::create([
            'name' => 'Team B',
            'code' => 'TEB'.uniqid(),
            'user_id' => $organizer->id,
            'created_by' => $organizer->id,
        ]);

        return TournamentMatch::create([
            'tournament_id' => $tournament->id,
            'home_team_id' => $teamA->id,
            'away_team_id' => $teamB->id,
            'match_date' => now()->toDateString(),
            'match_time' => '10:00:00',
            'venue_name' => 'Test Ground',
            'players_per_side' => 6,
            'overs' => 2,
        ]);
    }
}
