<?php

namespace Tests\Feature\Scoring;

use App\Enums\Event\MatchStatusEnum;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class MatchSquadSizeValidationTest extends TestCase
{
    use RefreshDatabase;

    private User $organizer;

    private TournamentMatch $match;

    private Team $homeTeam;

    /** @var array<int, User> */
    private array $homePlayers = [];

    protected function setUp(): void
    {
        parent::setUp();

        $this->organizer = User::factory()->create(['type' => 'user']);

        $tournament = Tournament::create([
            'organizer_id' => $this->organizer->id,
            'tournament_name' => 'Squad Validation Cup',
            'tournament_type' => 'league',
            'cricket_format' => 'tape_ball',
            'venue_name' => 'Ground',
            'start_date' => now()->toDateString(),
            'end_date' => now()->toDateString(),
            'number_of_teams' => 2,
            'city' => 'City',
            'match_timings' => 'day',
        ]);

        $this->homeTeam = Team::create([
            'name' => 'Team A',
            'code' => 'TEA'.uniqid(),
            'user_id' => $this->organizer->id,
            'created_by' => $this->organizer->id,
        ]);

        $awayTeam = Team::create([
            'name' => 'Team B',
            'code' => 'TEB'.uniqid(),
            'user_id' => $this->organizer->id,
            'created_by' => $this->organizer->id,
        ]);

        $this->homePlayers = User::factory()->count(11)->create()->all();
        $this->homeTeam->players()->sync(collect($this->homePlayers)->pluck('id')->all());

        $this->match = TournamentMatch::create([
            'tournament_id' => $tournament->id,
            'home_team_id' => $this->homeTeam->id,
            'away_team_id' => $awayTeam->id,
            'match_date' => now()->toDateString(),
            'match_time' => '10:00:00',
            'venue_name' => 'Ground',
            'players_per_side' => 11,
            'overs' => 20,
            'status' => MatchStatusEnum::TOSS_DONE->value,
            'toss_winner_team_id' => $this->homeTeam->id,
            'chose_to_bat_or_bowl' => 'bat',
        ]);
    }

    /** @param  int[]  $indexes */
    private function playerIdsFromIndexes(array $indexes): array
    {
        return array_map(fn (int $i) => $this->homePlayers[$i]->id, $indexes);
    }

    public function test_rejects_under_sized_match_squad_after_toss(): void
    {
        $playerIds = $this->playerIdsFromIndexes(range(0, 8));

        $this->actingAs($this->organizer, 'api')
            ->postJson(
                "/api/v1/matches/{$this->match->id}/teams/{$this->homeTeam->id}/squad",
                ['player_ids' => $playerIds],
            )
            ->assertStatus(409)
            ->assertJsonPath('type', 'CONFLICT')
            ->assertJsonPath('message', 'Squad must have at least 11 players once the match has started.');
    }

    public function test_accepts_full_match_squad_after_toss(): void
    {
        $playerIds = $this->playerIdsFromIndexes(range(0, 10));

        $this->actingAs($this->organizer, 'api')
            ->postJson(
                "/api/v1/matches/{$this->match->id}/teams/{$this->homeTeam->id}/squad",
                ['player_ids' => $playerIds],
            )
            ->assertOk()
            ->assertJsonPath('data.player_ids', $playerIds);

        $this->assertSame(11, DB::table('match_squads')->where('match_id', $this->match->id)->where('team_id', $this->homeTeam->id)->count());
    }

    public function test_rejects_under_sized_playing_eleven_after_toss(): void
    {
        $squadIds = $this->playerIdsFromIndexes(range(0, 10));
        $this->actingAs($this->organizer, 'api')
            ->postJson(
                "/api/v1/matches/{$this->match->id}/teams/{$this->homeTeam->id}/squad",
                ['player_ids' => $squadIds],
            )
            ->assertOk();

        $playingIds = $this->playerIdsFromIndexes(range(0, 8));

        $this->actingAs($this->organizer, 'api')
            ->postJson(
                "/api/v1/matches/{$this->match->id}/teams/{$this->homeTeam->id}/playing-eleven",
                ['player_ids' => $playingIds],
            )
            ->assertStatus(409)
            ->assertJsonPath('message', 'Playing eleven must have exactly 11 players once the match has started.');
    }

    public function test_rejects_completed_match_squad_update(): void
    {
        $this->match->update(['status' => MatchStatusEnum::COMPLETED->value]);

        $playerIds = $this->playerIdsFromIndexes(range(0, 10));

        $this->actingAs($this->organizer, 'api')
            ->postJson(
                "/api/v1/matches/{$this->match->id}/teams/{$this->homeTeam->id}/squad",
                ['player_ids' => $playerIds],
            )
            ->assertStatus(409)
            ->assertJsonPath('message', 'Match squad cannot be changed for a completed or cancelled match.');
    }

    public function test_allows_under_sized_match_squad_before_toss(): void
    {
        $this->match->update(['status' => MatchStatusEnum::SCHEDULED->value, 'toss_winner_team_id' => null, 'chose_to_bat_or_bowl' => null]);

        $playerIds = $this->playerIdsFromIndexes(range(0, 8));

        $this->actingAs($this->organizer, 'api')
            ->postJson(
                "/api/v1/matches/{$this->match->id}/teams/{$this->homeTeam->id}/squad",
                ['player_ids' => $playerIds],
            )
            ->assertOk()
            ->assertJsonPath('data.player_ids', $playerIds);
    }
}
