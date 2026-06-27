<?php

namespace Tests\Feature;

use App\Enums\Event\InningsStatusEnum;
use App\Enums\Event\MatchStatusEnum;
use App\Jobs\RefreshMatchStatsJob;
use App\Models\Innings;
use App\Models\PlayerBattingStats;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Models\User;
use App\Services\PlayerStatsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\Scoring\BuildsScoringMatch;
use Tests\TestCase;

class PlayerStatsByCricketFormatTest extends TestCase
{
    use BuildsScoringMatch;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        PlayerStatsService::bustRankingsCache();
        $this->organizer = User::factory()->create(['type' => 'user']);
        $this->players = User::factory()->count(8)->create()->all();
        $this->actingAs($this->organizer, 'api');
    }

    public function test_career_rows_are_isolated_by_cricket_format(): void
    {
        $tapeMatch = $this->createMatchForBucket('open_tournament', 'tape_ball');
        $hardMatch = $this->createMatchForBucket('open_tournament', 'hard_ball');

        $this->scoreRunsForStriker($tapeMatch, $this->player(0)->id, 30);
        $this->scoreRunsForStriker($hardMatch, $this->player(0)->id, 50);

        $tapeRow = PlayerBattingStats::where('player_id', $this->player(0)->id)
            ->where('tournament_type', 'open_tournament')
            ->where('cricket_format', 'tape_ball')
            ->first();
        $hardRow = PlayerBattingStats::where('player_id', $this->player(0)->id)
            ->where('tournament_type', 'open_tournament')
            ->where('cricket_format', 'hard_ball')
            ->first();

        $this->assertNotNull($tapeRow);
        $this->assertNotNull($hardRow);
        $this->assertSame(30, $tapeRow->runs);
        $this->assertSame(50, $hardRow->runs);
    }

    public function test_same_bucket_aggregates_across_tournaments(): void
    {
        $matchA = $this->createMatchForBucket('open_tournament', 'tape_ball');
        $matchB = $this->createMatchForBucket('open_tournament', 'tape_ball');

        $this->scoreRunsForStriker($matchA, $this->player(0)->id, 20);
        $this->scoreRunsForStriker($matchB, $this->player(0)->id, 15);

        $row = PlayerBattingStats::where('player_id', $this->player(0)->id)
            ->where('tournament_type', 'open_tournament')
            ->where('cricket_format', 'tape_ball')
            ->first();

        $this->assertNotNull($row);
        $this->assertSame(35, $row->runs);
        $this->assertSame(2, $row->matches);
    }

    public function test_profile_stats_api_supports_format_filter(): void
    {
        $tapeMatch = $this->createMatchForBucket('open_tournament', 'tape_ball');
        $hardMatch = $this->createMatchForBucket('open_tournament', 'hard_ball');
        $this->scoreRunsForStriker($tapeMatch, $this->player(0)->id, 12);
        $this->scoreRunsForStriker($hardMatch, $this->player(0)->id, 88);

        $response = $this->getJson('/api/v1/users/'.$this->player(0)->id.'/stats?'.http_build_query([
            'tournament_type' => 'open_tournament',
            'cricket_format' => 'tape_ball',
        ]));

        $response->assertOk();
        $response->assertJsonPath('data.tournament_type', 'open_tournament');
        $response->assertJsonPath('data.cricket_format', 'tape_ball');
        $response->assertJsonPath('data.batting.runs', 12);
    }

    public function test_profile_rollup_across_types_for_single_format(): void
    {
        $openMatch = $this->createMatchForBucket('open_tournament', 'tape_ball');
        $leagueMatch = $this->createMatchForBucket('league', 'tape_ball');
        $this->scoreRunsForStriker($openMatch, $this->player(0)->id, 10);
        $this->scoreRunsForStriker($leagueMatch, $this->player(0)->id, 25);

        $response = $this->getJson('/api/v1/users/'.$this->player(0)->id.'/stats?'.http_build_query([
            'tournament_type' => 'all',
            'cricket_format' => 'tape_ball',
        ]));

        $response->assertOk();
        $response->assertJsonPath('data.batting.runs', 35);
    }

    public function test_rankings_filter_by_cricket_format(): void
    {
        $tapeMatch = $this->createMatchForBucket('open_tournament', 'tape_ball');
        $hardMatch = $this->createMatchForBucket('open_tournament', 'hard_ball');

        $this->scoreRunsForStriker($tapeMatch, $this->player(0)->id, 100);
        $this->scoreRunsForStriker($hardMatch, $this->player(1)->id, 200);

        $response = $this->getJson('/api/v1/rankings?'.http_build_query([
            'tournament_type' => 'open_tournament',
            'cricket_format' => 'tape_ball',
            'category' => 'batting',
            'sort' => 'runs',
        ]));

        $response->assertOk();
        $response->assertJsonPath('data.cricket_format', 'tape_ball');
        $playerIds = collect($response->json('data.rankings'))->pluck('player_id')->all();
        $this->assertSame([$this->player(0)->id], $playerIds);
    }

    public function test_rankings_reject_invalid_category(): void
    {
        $this->getJson('/api/v1/rankings?tournament_type=open_tournament&category=invalid')
            ->assertStatus(400)
            ->assertJsonFragment(['message' => 'category must be one of: batting, bowling, fielding.']);
    }

    public function test_rankings_reject_tournament_type_all(): void
    {
        $this->getJson('/api/v1/rankings?tournament_type=all&category=batting')
            ->assertStatus(400)
            ->assertJsonFragment(['message' => 'tournament_type must be one of: league, open_tournament, emerging.']);
    }

    public function test_player_stats_service_reads_materialized_bucket(): void
    {
        $match = $this->createMatchForBucket('open_tournament', 'tape_ball');
        $this->scoreRunsForStriker($match, $this->player(0)->id, 42);

        $service = app(PlayerStatsService::class);
        $stats = $service->battingForPlayer(
            $this->player(0)->id,
            'open_tournament',
            'tape_ball'
        );

        $this->assertSame(42, $stats['runs']);
    }

    public function test_all_all_bowling_rollup_uses_cricket_overs_notation(): void
    {
        $match = $this->createMatchForBucket('open_tournament', 'tape_ball');
        $innings = Innings::where('match_id', $match->id)->where('innings_number', 1)->firstOrFail();
        $bowlerId = $this->player(6)->id;

        for ($i = 1; $i <= 5; $i++) {
            $this->recordBall($innings, [
                'striker_id' => $this->player(0)->id,
                'non_striker_id' => $this->player(1)->id,
                'bowler_id' => $bowlerId,
                'over' => 0,
                'ball_in_over' => $i,
                'runs' => 0,
                'runs_off_bat' => 0,
            ]);
        }

        $this->recordBall($innings, [
            'striker_id' => $this->player(0)->id,
            'non_striker_id' => $this->player(1)->id,
            'bowler_id' => $bowlerId,
            'over' => 0,
            'ball_in_over' => 6,
            'runs' => 1,
            'runs_off_bat' => 0,
            'is_wide' => true,
        ]);

        RefreshMatchStatsJob::dispatchSync($match->id);

        $service = app(PlayerStatsService::class);
        $stats = $service->bowlingForPlayer($bowlerId, 'all', 'all');

        $this->assertSame(0.5, $stats['overs']);
        $this->assertSame(1.2, $stats['economy']);
        $this->assertSame(1, $stats['wides']);
    }

    public function test_profile_all_all_bowling_api_uses_cricket_overs(): void
    {
        $match = $this->createMatchForBucket('open_tournament', 'tape_ball');
        $innings = Innings::where('match_id', $match->id)->where('innings_number', 1)->firstOrFail();
        $bowlerId = $this->player(6)->id;

        for ($i = 1; $i <= 5; $i++) {
            $this->recordBall($innings, [
                'striker_id' => $this->player(0)->id,
                'non_striker_id' => $this->player(1)->id,
                'bowler_id' => $bowlerId,
                'over' => 0,
                'ball_in_over' => $i,
                'runs' => 6,
                'runs_off_bat' => 6,
            ]);
        }

        RefreshMatchStatsJob::dispatchSync($match->id);

        $response = $this->getJson('/api/v1/users/'.$bowlerId.'/stats?'.http_build_query([
            'tournament_type' => 'all',
            'cricket_format' => 'all',
        ]));

        $response->assertOk();
        $response->assertJsonPath('data.bowling.overs', 0.5);
        $response->assertJsonPath('data.bowling.runs_conceded', 30);
        $response->assertJsonPath('data.bowling.economy', 36);
    }

    // ─── Regression tests for the three P0 audit bugs ────────────────────────

    /**
     * Batting average sort must be descending (higher average = better).
     * Previously both average and strike_rate sorted ascending, putting worst batters first.
     */
    public function test_batting_rankings_sort_by_average_descending(): void
    {
        $match = $this->createMatchForBucket('open_tournament', 'tape_ball');
        $innings = Innings::where('match_id', $match->id)->where('innings_number', 1)->firstOrFail();
        $bowlerId = $this->player(6)->id;

        // Player 0: 40 runs, 1 dismissal → average 40.
        $this->recordBall($innings, [
            'striker_id' => $this->player(0)->id, 'non_striker_id' => $this->player(1)->id,
            'bowler_id' => $bowlerId, 'over' => 0, 'ball_in_over' => 1,
            'runs' => 40, 'runs_off_bat' => 40,
        ]);
        $this->recordBall($innings, [
            'striker_id' => $this->player(0)->id, 'non_striker_id' => $this->player(1)->id,
            'bowler_id' => $bowlerId, 'over' => 0, 'ball_in_over' => 2,
            'runs' => 0, 'runs_off_bat' => 0,
            'is_wicket' => true, 'dismissal_type' => 'bowled', 'out_player_id' => $this->player(0)->id,
        ]);

        // Player 2: 10 runs, 1 dismissal → average 10.
        $this->recordBall($innings, [
            'striker_id' => $this->player(2)->id, 'non_striker_id' => $this->player(1)->id,
            'bowler_id' => $bowlerId, 'over' => 0, 'ball_in_over' => 3,
            'runs' => 10, 'runs_off_bat' => 10,
        ]);
        $this->recordBall($innings, [
            'striker_id' => $this->player(2)->id, 'non_striker_id' => $this->player(1)->id,
            'bowler_id' => $bowlerId, 'over' => 0, 'ball_in_over' => 4,
            'runs' => 0, 'runs_off_bat' => 0,
            'is_wicket' => true, 'dismissal_type' => 'bowled', 'out_player_id' => $this->player(2)->id,
        ]);

        RefreshMatchStatsJob::dispatchSync($match->id);

        $response = $this->getJson('/api/v1/rankings?'.http_build_query([
            'tournament_type' => 'open_tournament',
            'cricket_format' => 'tape_ball',
            'category' => 'batting',
            'sort' => 'average',
        ]));

        $response->assertOk();
        $rankings = $response->json('data.rankings');
        // Player with average 40 must rank above player with average 10.
        $this->assertSame($this->player(0)->id, $rankings[0]['player_id']);
        $this->assertSame($this->player(2)->id, $rankings[1]['player_id']);
    }

    /**
     * BBM must only count bowler-credited wickets (bowled/caught/stumped/lbw/hit_wicket).
     * A run-out off the bowler's delivery must NOT inflate the match figures.
     */
    public function test_best_bowling_match_excludes_run_out_wickets(): void
    {
        $match = $this->createMatchForBucket('open_tournament', 'tape_ball');
        $innings = Innings::where('match_id', $match->id)->where('innings_number', 1)->firstOrFail();
        $bowlerId = $this->player(6)->id;

        // Bowled wicket — counts as bowler wicket.
        $this->recordBall($innings, [
            'striker_id' => $this->player(0)->id, 'non_striker_id' => $this->player(1)->id,
            'bowler_id' => $bowlerId, 'over' => 0, 'ball_in_over' => 1,
            'runs' => 0, 'runs_off_bat' => 0,
            'is_wicket' => true, 'dismissal_type' => 'bowled', 'out_player_id' => $this->player(0)->id,
        ]);
        // Run-out off the same bowler — must NOT count as bowler wicket in BBM.
        $this->recordBall($innings, [
            'striker_id' => $this->player(2)->id, 'non_striker_id' => $this->player(3)->id,
            'bowler_id' => $bowlerId, 'over' => 0, 'ball_in_over' => 2,
            'runs' => 0, 'runs_off_bat' => 0,
            'is_wicket' => true, 'dismissal_type' => 'run_out',
            'out_player_id' => $this->player(3)->id, 'fielder_id' => $this->player(4)->id,
        ]);

        RefreshMatchStatsJob::dispatchSync($match->id);

        $service = app(PlayerStatsService::class);
        // Use compute path (cricket_format=all has no materialized row).
        $stats = $service->bowlingForPlayer($bowlerId, 'open_tournament', 'all');

        // BBM should be 1/0 (one bowler wicket, zero runs), not 2/0.
        $this->assertSame('1/0', $stats['best_bowling_match']);
        // Wickets total must also be 1 (only the bowled).
        $this->assertSame(1, $stats['wickets']);
    }

    /**
     * ten_wickets must count only bowler-credited wickets in the compute path.
     * A match with 10 run-outs off one bowler's deliveries must NOT register as a 10-wicket match.
     */
    public function test_ten_wickets_excludes_non_bowler_dismissals(): void
    {
        $match = $this->createMatchForBucket('open_tournament', 'tape_ball');
        $innings1 = Innings::where('match_id', $match->id)->where('innings_number', 1)->firstOrFail();
        $innings2 = Innings::where('match_id', $match->id)->where('innings_number', 2)->firstOrFail();
        $bowlerId = $this->player(6)->id;

        // 5 run-outs in each innings = 10 non-bowler wickets — must NOT count.
        foreach ([[$innings1, 0], [$innings2, 0]] as [$inn, $ballOffset]) {
            for ($i = 1; $i <= 5; $i++) {
                $strikerId = $this->player(0)->id;
                $outPlayerId = $this->player(1)->id;
                $this->recordBall($inn, [
                    'striker_id' => $strikerId, 'non_striker_id' => $outPlayerId,
                    'bowler_id' => $bowlerId, 'over' => 0, 'ball_in_over' => $i,
                    'runs' => 0, 'runs_off_bat' => 0,
                    'is_wicket' => true, 'dismissal_type' => 'run_out',
                    'out_player_id' => $outPlayerId, 'fielder_id' => $this->player(4)->id,
                ]);
            }
        }

        RefreshMatchStatsJob::dispatchSync($match->id);

        $service = app(PlayerStatsService::class);
        $stats = $service->bowlingForPlayer($bowlerId, 'open_tournament', 'all');

        $this->assertSame(0, $stats['ten_wickets']);
        $this->assertSame(0, $stats['wickets']);
    }

    /**
     * Law 41 penalty-only awards must not debit the bowler's runs_conceded / economy.
     */
    public function test_penalty_only_awards_do_not_inflate_bowler_runs_conceded(): void
    {
        $match = $this->createMatchForBucket('open_tournament', 'tape_ball');
        $innings = Innings::where('match_id', $match->id)->where('innings_number', 1)->firstOrFail();
        $bowlerId = $this->player(6)->id;

        $this->recordBall($innings, [
            'bowler_id' => $bowlerId,
            'over' => 0,
            'ball_in_over' => 1,
            'runs' => 4,
            'runs_off_bat' => 4,
        ]);
        $this->recordBall($innings, [
            'bowler_id' => $bowlerId,
            'over' => 0,
            'ball_in_over' => 2,
            'runs' => 0,
            'runs_off_bat' => 0,
            'penalty_runs' => 5,
            'penalty_team' => 'batting',
            'penalty_reason' => 'time_wasting_bowling',
        ]);

        RefreshMatchStatsJob::dispatchSync($match->id);

        $service = app(PlayerStatsService::class);
        $stats = $service->bowlingForPlayer($bowlerId, 'open_tournament', 'all');

        $this->assertSame(4, $stats['runs_conceded']);
        $this->assertSame(24.0, $stats['economy']);
    }

    public function test_rankings_cache_is_invalidated_after_match_stats_refresh(): void
    {
        $match = $this->createMatchForBucket('open_tournament', 'tape_ball');
        $innings = Innings::where('match_id', $match->id)->where('innings_number', 1)->firstOrFail();

        $this->recordBall($innings, [
            'striker_id' => $this->player(0)->id,
            'runs' => 50,
            'runs_off_bat' => 50,
            'ball_in_over' => 1,
        ]);
        RefreshMatchStatsJob::dispatchSync($match->id);

        $service = app(PlayerStatsService::class);
        $first = collect($service->rankings('open_tournament', 'batting', 'runs', 0, 'tape_ball'));
        $this->assertSame(50, $first->firstWhere('player_id', $this->player(0)->id)['stats']['runs']);

        $this->recordBall($innings, [
            'striker_id' => $this->player(0)->id,
            'runs' => 10,
            'runs_off_bat' => 10,
            'ball_in_over' => 2,
        ]);
        RefreshMatchStatsJob::dispatchSync($match->id);

        $second = collect($service->rankings('open_tournament', 'batting', 'runs', 0, 'tape_ball'));
        $this->assertSame(60, $second->firstWhere('player_id', $this->player(0)->id)['stats']['runs']);
    }

    private function createMatchForBucket(string $tournamentType, string $cricketFormat): TournamentMatch
    {
        $tournament = Tournament::create([
            'organizer_id' => $this->organizer->id,
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
            'user_id' => $this->organizer->id,
            'created_by' => $this->organizer->id,
        ]);

        $teamB = Team::create([
            'name' => 'Team B '.uniqid(),
            'code' => 'TEB'.uniqid(),
            'user_id' => $this->organizer->id,
            'created_by' => $this->organizer->id,
        ]);

        $match = TournamentMatch::create([
            'tournament_id' => $tournament->id,
            'home_team_id' => $teamA->id,
            'away_team_id' => $teamB->id,
            'match_date' => now()->toDateString(),
            'match_time' => '10:00:00',
            'venue_name' => 'Test Ground',
            'players_per_side' => 3,
            'overs' => 2,
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

    private function scoreRunsForStriker(TournamentMatch $match, int $strikerId, int $runs): void
    {
        $innings = Innings::where('match_id', $match->id)->where('innings_number', 1)->firstOrFail();
        $bowlerId = $this->players[6]->id ?? User::factory()->create()->id;

        $this->recordBall($innings, [
            'striker_id' => $strikerId,
            'non_striker_id' => $this->players[1]->id,
            'bowler_id' => $bowlerId,
            'runs' => $runs,
            'runs_off_bat' => $runs,
        ]);

        RefreshMatchStatsJob::dispatchSync($match->id);
    }
}
