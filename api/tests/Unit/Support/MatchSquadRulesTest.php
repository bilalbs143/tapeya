<?php

namespace Tests\Unit\Support;

use App\Enums\Event\MatchStatusEnum;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Models\User;
use App\Support\MatchSquadRules;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class MatchSquadRulesTest extends TestCase
{
    use RefreshDatabase;

    private function makeMatch(string $status, int $playersPerSide = 11): TournamentMatch
    {
        $organizer = User::factory()->create(['type' => 'user']);
        $tournament = Tournament::create([
            'organizer_id' => $organizer->id,
            'tournament_name' => 'Rules Cup',
            'tournament_type' => 'league',
            'cricket_format' => 'tape_ball',
            'venue_name' => 'Ground',
            'start_date' => now()->toDateString(),
            'end_date' => now()->toDateString(),
            'number_of_teams' => 2,
            'city' => 'City',
            'match_timings' => 'day',
        ]);

        $home = Team::create([
            'name' => 'Home',
            'code' => 'HOM'.uniqid(),
            'user_id' => $organizer->id,
            'created_by' => $organizer->id,
        ]);
        $away = Team::create([
            'name' => 'Away',
            'code' => 'AWY'.uniqid(),
            'user_id' => $organizer->id,
            'created_by' => $organizer->id,
        ]);

        return TournamentMatch::create([
            'tournament_id' => $tournament->id,
            'home_team_id' => $home->id,
            'away_team_id' => $away->id,
            'match_date' => now()->toDateString(),
            'match_time' => '10:00:00',
            'venue_name' => 'Ground',
            'players_per_side' => $playersPerSide,
            'overs' => 20,
            'status' => $status,
        ]);
    }

    public function test_scheduled_match_squad_allows_nine_players(): void
    {
        $match = $this->makeMatch(MatchStatusEnum::SCHEDULED->value);

        $this->assertNull(MatchSquadRules::matchSquadSizeError($match, 9));
    }

    public function test_toss_done_match_squad_rejects_nine_players_for_eleven_a_side(): void
    {
        $match = $this->makeMatch(MatchStatusEnum::TOSS_DONE->value);

        $this->assertSame(
            'Squad must have at least 11 players once the match has started.',
            MatchSquadRules::matchSquadSizeError($match, 9),
        );
    }

    public function test_completed_match_squad_is_locked(): void
    {
        $match = $this->makeMatch(MatchStatusEnum::COMPLETED->value);

        $this->assertSame(
            'Match squad cannot be changed for a completed or cancelled match.',
            MatchSquadRules::matchSquadSizeError($match, 11),
        );
    }

    public function test_toss_done_playing_eleven_requires_exactly_players_per_side(): void
    {
        $match = $this->makeMatch(MatchStatusEnum::TOSS_DONE->value);

        $this->assertSame(
            'Playing eleven must have exactly 11 players once the match has started.',
            MatchSquadRules::playingElevenSizeError($match, 9),
        );
        $this->assertSame(
            'Playing eleven cannot exceed 11 players.',
            MatchSquadRules::playingElevenSizeError($match, 12),
        );
        $this->assertNull(MatchSquadRules::playingElevenSizeError($match, 11));
    }

    public function test_scheduled_playing_eleven_allows_one_player(): void
    {
        $match = $this->makeMatch(MatchStatusEnum::SCHEDULED->value);

        $this->assertNull(MatchSquadRules::playingElevenSizeError($match, 1));
    }

    public function test_roster_subset_requires_team_user(): void
    {
        $match = $this->makeMatch(MatchStatusEnum::SCHEDULED->value);
        $player = User::factory()->create(['type' => 'user']);
        $home = $match->homeTeam()->first();

        $this->assertNotNull(MatchSquadRules::rosterSubsetError($match, $home, [$player->id]));

        $home->players()->attach($player->id);

        $this->assertNull(MatchSquadRules::rosterSubsetError($match, $home, [$player->id]));
    }

    public function test_playing_eleven_subset_requires_match_squad(): void
    {
        $match = $this->makeMatch(MatchStatusEnum::SCHEDULED->value);
        $player = User::factory()->create(['type' => 'user']);
        $home = $match->homeTeam()->first();

        $this->assertNotNull(MatchSquadRules::playingElevenSubsetError($match, $home, [$player->id]));

        DB::table('match_squads')->insert([
            'match_id' => $match->id,
            'team_id' => $home->id,
            'user_id' => $player->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->assertNull(MatchSquadRules::playingElevenSubsetError($match, $home, [$player->id]));
    }
}
