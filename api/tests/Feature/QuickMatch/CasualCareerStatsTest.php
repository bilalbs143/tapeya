<?php

namespace Tests\Feature\QuickMatch;

use App\Enums\Event\CricketFormatEnum;
use App\Enums\Event\InningsStatusEnum;
use App\Enums\Event\MatchKindEnum;
use App\Enums\Event\MatchStatusEnum;
use App\Jobs\RefreshMatchStatsJob;
use App\Models\CricketMatch;
use App\Models\Innings;
use App\Models\PlayerBattingStats;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\User;
use App\Services\PlayerStatsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\Support\QuickMatch\CreatesQuickMatch;
use Tests\Support\Scoring\BuildsScoringMatch;
use Tests\TestCase;

class CasualCareerStatsTest extends TestCase
{
    use BuildsScoringMatch;
    use CreatesQuickMatch;
    use RefreshDatabase;

    private User $owner;

    /** @var array<int, User> */
    private array $squad = [];

    protected function setUp(): void
    {
        parent::setUp();
        PlayerStatsService::bustRankingsCache();
        $this->owner = User::factory()->create(['type' => 'user', 'status' => 'active']);
        $this->players = User::factory()->count(8)->create(['type' => 'user', 'status' => 'active'])->all();
        $this->squad = $this->players;
        $this->actingAs($this->owner, 'api');
    }

    public function test_quick_match_refresh_writes_quick_career_row(): void
    {
        $match = $this->readyQuickMatch();
        $striker = $this->squad[0];
        $this->scoreRunsOnMatch($match, $striker->id, 24);

        $row = PlayerBattingStats::query()
            ->where('player_id', $striker->id)
            ->where('tournament_type', 'quick')
            ->where('cricket_format', CricketFormatEnum::TAPE_BALL->value)
            ->first();

        $this->assertNotNull($row);
        $this->assertSame(24, (int) $row->runs);
        $this->assertSame(1, (int) $row->matches);
        $this->assertSame(0, PlayerBattingStats::query()
            ->where('player_id', $striker->id)
            ->whereIn('tournament_type', ['league', 'open_tournament', 'emerging'])
            ->count());
    }

    public function test_profile_stats_api_returns_quick_bucket(): void
    {
        $match = $this->readyQuickMatch();
        $striker = $this->squad[0];
        $this->scoreRunsOnMatch($match, $striker->id, 17);

        $this->getJson('/api/v1/users/'.$striker->id.'/stats?'.http_build_query([
            'tournament_type' => 'quick',
            'cricket_format' => 'tape_ball',
        ]))
            ->assertOk()
            ->assertJsonPath('data.tournament_type', 'quick')
            ->assertJsonPath('data.batting.runs', 17)
            ->assertJsonPath('data.batting.matches', 1);
    }

    public function test_profile_all_excludes_quick_contributions(): void
    {
        $quick = $this->readyQuickMatch();
        $striker = $this->squad[0];
        $this->scoreRunsOnMatch($quick, $striker->id, 40);

        $ot = $this->createTournamentMatch('open_tournament', 'tape_ball');
        $this->scoreRunsOnMatch($ot, $striker->id, 11);

        $this->getJson('/api/v1/users/'.$striker->id.'/stats?'.http_build_query([
            'tournament_type' => 'all',
            'cricket_format' => 'all',
        ]))
            ->assertOk()
            ->assertJsonPath('data.batting.runs', 11);

        $this->getJson('/api/v1/users/'.$striker->id.'/stats?'.http_build_query([
            'tournament_type' => 'quick',
            'cricket_format' => 'all',
        ]))
            ->assertOk()
            ->assertJsonPath('data.batting.runs', 40);
    }

    public function test_rankings_reject_quick_tournament_type(): void
    {
        $this->getJson('/api/v1/rankings?'.http_build_query([
            'tournament_type' => 'quick',
            'category' => 'batting',
        ]))->assertStatus(400);
    }

    public function test_quick_refresh_does_not_bust_rankings_cache(): void
    {
        $ot = $this->createTournamentMatch('open_tournament', 'tape_ball');
        $striker = $this->squad[0];
        $this->scoreRunsOnMatch($ot, $striker->id, 50);

        $versionBefore = Cache::get('player_stats.rankings.version');

        $quick = $this->readyQuickMatch();
        $this->scoreRunsOnMatch($quick, $striker->id, 9);

        $this->assertSame($versionBefore, Cache::get('player_stats.rankings.version'));

        $otRow = PlayerBattingStats::query()
            ->where('player_id', $striker->id)
            ->where('tournament_type', 'open_tournament')
            ->where('cricket_format', 'tape_ball')
            ->first();
        $this->assertNotNull($otRow);
        $this->assertSame(50, (int) $otRow->runs);
    }

    private function readyQuickMatch(): CricketMatch
    {
        $match = $this->createQuickMatch($this->owner, [
            'status' => MatchStatusEnum::IN_PROGRESS->value,
            'cricket_format' => CricketFormatEnum::TAPE_BALL,
            'players_per_side' => 2,
            'overs' => 5,
        ]);

        Innings::create([
            'match_id' => $match->id,
            'innings_number' => 1,
            'batting_team_id' => $match->home_team_id,
            'bowling_team_id' => $match->away_team_id,
            'status' => InningsStatusEnum::IN_PROGRESS->value,
        ]);
        Innings::create([
            'match_id' => $match->id,
            'innings_number' => 2,
            'batting_team_id' => $match->away_team_id,
            'bowling_team_id' => $match->home_team_id,
            'status' => InningsStatusEnum::NOT_STARTED->value,
        ]);

        $this->assertTrue($match->fresh()->isQuick());
        $this->assertSame(MatchKindEnum::QUICK, $match->fresh()->kind);

        return $match->fresh();
    }

    private function createTournamentMatch(string $tournamentType, string $cricketFormat): CricketMatch
    {
        $tournament = Tournament::create([
            'organizer_id' => $this->owner->id,
            'tournament_name' => 'Cup '.uniqid(),
            'tournament_type' => $tournamentType,
            'cricket_format' => $cricketFormat,
            'venue_name' => 'Test Ground',
            'start_date' => now()->toDateString(),
            'end_date' => now()->toDateString(),
            'number_of_teams' => 2,
            'city' => 'Test City',
            'match_timings' => 'day',
        ]);

        $teamA = Team::create([
            'name' => 'Team A '.uniqid(),
            'code' => 'TEA'.uniqid(),
            'user_id' => $this->owner->id,
            'created_by' => $this->owner->id,
        ]);
        $teamB = Team::create([
            'name' => 'Team B '.uniqid(),
            'code' => 'TEB'.uniqid(),
            'user_id' => $this->owner->id,
            'created_by' => $this->owner->id,
        ]);

        $match = CricketMatch::create([
            'tournament_id' => $tournament->id,
            'kind' => MatchKindEnum::TOURNAMENT,
            'home_team_id' => $teamA->id,
            'away_team_id' => $teamB->id,
            'match_date' => now()->toDateString(),
            'match_time' => '10:00:00',
            'venue_name' => 'Test Ground',
            'players_per_side' => 2,
            'overs' => 5,
            'status' => MatchStatusEnum::IN_PROGRESS->value,
            'toss_winner_team_id' => $teamA->id,
            'chose_to_bat_or_bowl' => 'bat',
        ]);

        Innings::create([
            'match_id' => $match->id,
            'innings_number' => 1,
            'batting_team_id' => $teamA->id,
            'bowling_team_id' => $teamB->id,
            'status' => InningsStatusEnum::IN_PROGRESS->value,
        ]);
        Innings::create([
            'match_id' => $match->id,
            'innings_number' => 2,
            'batting_team_id' => $teamB->id,
            'bowling_team_id' => $teamA->id,
            'status' => InningsStatusEnum::NOT_STARTED->value,
        ]);

        return $match;
    }

    private function scoreRunsOnMatch(CricketMatch $match, int $strikerId, int $runs): void
    {
        $innings = Innings::where('match_id', $match->id)->where('innings_number', 1)->firstOrFail();
        $bowlerId = $this->squad[2]->id;
        $nonStrikerId = $this->squad[1]->id;

        $this->recordBall($innings, [
            'striker_id' => $strikerId,
            'non_striker_id' => $nonStrikerId,
            'bowler_id' => $bowlerId,
            'runs' => $runs,
            'runs_off_bat' => $runs,
        ]);

        RefreshMatchStatsJob::dispatchSync($match->id);
    }
}
