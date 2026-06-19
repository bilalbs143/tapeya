<?php

namespace Tests\Support\Scoring;

use App\Enums\Event\InningsStatusEnum;
use App\Enums\Event\MatchStatusEnum;
use App\Models\Ball;
use App\Models\Innings;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Creates a minimal match + two innings for integration-style scoring tests (PostgreSQL).
 */
trait BuildsScoringMatch
{
    use RefreshDatabase;

    protected TournamentMatch $scoringMatch;

    protected Innings $innings1;

    protected Innings $innings2;

    protected User $organizer;

    /** @var array<int, User> */
    protected array $players = [];

    protected function setUpScoringMatch(int $overs = 2, int $playersPerSide = 3): void
    {
        $this->organizer = User::factory()->create(['type' => 'user']);

        $this->players = User::factory()->count(8)->create()->all();

        $tournament = Tournament::create([
            'organizer_id' => $this->organizer->id,
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
            'user_id' => $this->organizer->id,
            'created_by' => $this->organizer->id,
        ]);

        $teamB = Team::create([
            'name' => 'Team B',
            'code' => 'TEB'.uniqid(),
            'user_id' => $this->organizer->id,
            'created_by' => $this->organizer->id,
        ]);

        $this->scoringMatch = TournamentMatch::create([
            'tournament_id' => $tournament->id,
            'home_team_id' => $teamA->id,
            'away_team_id' => $teamB->id,
            'match_date' => now()->toDateString(),
            'match_time' => '10:00:00',
            'venue_name' => 'Test Ground',
            'players_per_side' => $playersPerSide,
            'overs' => $overs,
            'status' => MatchStatusEnum::IN_PROGRESS->value,
            'toss_winner_team_id' => $teamA->id,
            'chose_to_bat_or_bowl' => 'bat',
        ]);

        $this->innings1 = Innings::create([
            'match_id' => $this->scoringMatch->id,
            'innings_number' => 1,
            'batting_team_id' => $teamA->id,
            'bowling_team_id' => $teamB->id,
            'status' => InningsStatusEnum::IN_PROGRESS->value,
        ]);

        $this->innings2 = Innings::create([
            'match_id' => $this->scoringMatch->id,
            'innings_number' => 2,
            'batting_team_id' => $teamB->id,
            'bowling_team_id' => $teamA->id,
            'status' => InningsStatusEnum::NOT_STARTED->value,
        ]);
    }

    protected function player(int $index): User
    {
        return $this->players[$index];
    }

    /**
     * Seed match_squads so substitute / squad validation HTTP tests can run.
     * Players 0–5 → innings-1 batting team; 6–7 → innings-1 bowling team.
     */
    protected function seedMatchSquads(): void
    {
        $battingTeamId = (int) $this->innings1->batting_team_id;
        $bowlingTeamId = (int) $this->innings1->bowling_team_id;
        $now = now();
        $rows = [];

        foreach (range(0, 5) as $i) {
            $rows[] = [
                'match_id' => $this->scoringMatch->id,
                'team_id' => $battingTeamId,
                'user_id' => $this->player($i)->id,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        foreach ([6, 7] as $i) {
            $rows[] = [
                'match_id' => $this->scoringMatch->id,
                'team_id' => $bowlingTeamId,
                'user_id' => $this->player($i)->id,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        DB::table('match_squads')->insert($rows);
    }

    /**
     * @param  array<string, mixed>  $attrs
     */
    protected function recordBall(Innings $innings, array $attrs): Ball
    {
        return $innings->balls()->create(array_merge([
            'over' => 0,
            'ball_in_over' => 1,
            'striker_id' => $this->player(0)->id,
            'non_striker_id' => $this->player(1)->id,
            'bowler_id' => $this->player(6)->id,
            'runs' => 0,
            'runs_off_bat' => 0,
        ], $attrs));
    }

    /**
     * @param  list<array<string, mixed>>  $deliveries
     */
    protected function recordSequence(Innings $innings, array $deliveries): Collection
    {
        $balls = collect();
        $legal = 0;
        $over = 0;
        $ballInOver = 1;

        foreach ($deliveries as $attrs) {
            $ball = new Ball(array_merge([
                'over' => $over,
                'ball_in_over' => $ballInOver,
                'striker_id' => $this->player(0)->id,
                'non_striker_id' => $this->player(1)->id,
                'bowler_id' => $this->player(6)->id,
                'runs' => 0,
                'runs_off_bat' => 0,
                'is_no_ball' => false,
                'is_wide' => false,
                'is_bye' => false,
                'is_leg_bye' => false,
                'is_wicket' => false,
                'is_free_hit' => false,
                'dont_count_ball' => false,
            ], $attrs));

            $saved = $innings->balls()->create($ball->getAttributes());
            $balls->push($saved);

            $ballInOver++;
            if ($saved->isLegalDelivery()) {
                $legal++;
                if ($legal % 6 === 0) {
                    $over++;
                    $ballInOver = 1;
                }
            }
        }

        return $balls;
    }
}
