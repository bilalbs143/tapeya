<?php

namespace Tests\Unit\Services\Scoring;

use App\Enums\Event\DismissalTypeEnum;
use App\Services\PlayerStatsService;
use Tests\Support\Scoring\BallFactory;
use Tests\Support\Scoring\PlayerIds;

/**
 * Partnership aggregation — must align with MatchStateService current-partnership rules.
 */
class PlayerStatsPartnershipsTest extends ScoringUnitTestCase
{
    private PlayerStatsService $playerStats;

    protected function setUp(): void
    {
        parent::setUp();
        $this->playerStats = new PlayerStatsService;
    }

    public function test_first_partnership_runs_and_balls(): void
    {
        $balls = BallFactory::collection([
            BallFactory::legal(4),
            BallFactory::legal(2),
            BallFactory::legal(1),
        ]);

        $partnerships = $this->playerStats->partnershipsForInnings(1, $balls);
        $current = end($partnerships);

        $this->assertSame(7, $current['runs']);
        $this->assertSame(3, $current['balls']);
        $this->assertNull($current['wicket_number']);
    }

    public function test_wicket_closes_partnership_and_starts_new(): void
    {
        $balls = BallFactory::collection([
            BallFactory::legal(10),
            BallFactory::wicket(DismissalTypeEnum::BOWLED, PlayerIds::STRIKER),
            BallFactory::legal(5),
        ]);

        $partnerships = $this->playerStats->partnershipsForInnings(1, $balls);

        $this->assertCount(2, $partnerships);
        $this->assertSame(10, $partnerships[0]['runs']);
        $this->assertSame(1, $partnerships[0]['wicket_number']);
        $this->assertSame(5, $partnerships[1]['runs']);
        $this->assertNull($partnerships[1]['wicket_number']);
    }

    /**
     * Regression: retired hurt must NOT break the partnership (S3 / MatchStateService parity).
     */
    public function test_retired_hurt_does_not_end_partnership(): void
    {
        $balls = BallFactory::collection([
            BallFactory::legal(6),
            BallFactory::wicket(DismissalTypeEnum::RETIRED_HURT, PlayerIds::STRIKER),
            BallFactory::legal(4),
        ]);

        $partnerships = $this->playerStats->partnershipsForInnings(1, $balls);

        $this->assertCount(1, $partnerships);
        $this->assertSame(10, $partnerships[0]['runs']);
        $this->assertNull($partnerships[0]['wicket_number']);
    }

    public function test_partnership_includes_wide_runs_in_total_but_not_in_ball_count(): void
    {
        $balls = BallFactory::collection([
            BallFactory::legal(2),
            BallFactory::wide(3),
        ]);

        $partnerships = $this->playerStats->partnershipsForInnings(1, $balls);

        $this->assertSame(5, $partnerships[0]['runs']);
        $this->assertSame(1, $partnerships[0]['balls'], 'Wide does not count as a partnership ball');
    }

    public function test_partnership_ball_count_matches_match_state_live_partnership(): void
    {
        $balls = BallFactory::collection([
            BallFactory::legal(1),
            BallFactory::wide(2),
            BallFactory::noBall(4),
            BallFactory::legal(0),
        ]);

        $partnerships = $this->playerStats->partnershipsForInnings(1, $balls);

        $liveBalls = 0;
        foreach ($balls as $ball) {
            if ($ball->isLegalDelivery()) {
                $liveBalls++;
            }
        }

        $this->assertSame($liveBalls, $partnerships[0]['balls']);
        $this->assertSame(2, $partnerships[0]['balls'], 'Only legal deliveries count');
    }

    public function test_no_ball_striker_runs_use_striker_runs_off_bat_helper(): void
    {
        $balls = BallFactory::collection([
            BallFactory::make([
                'is_no_ball' => true,
                'runs' => 5,
                'runs_off_bat' => 0,
            ]),
        ]);

        $partnerships = $this->playerStats->partnershipsForInnings(1, $balls);
        $strikerRuns = $partnerships[0]['player_1_id'] === PlayerIds::STRIKER
            ? $partnerships[0]['player_1_runs']
            : $partnerships[0]['player_2_runs'];

        $this->assertSame(4, $strikerRuns, 'NB total 5 with missing runs_off_bat → 4 off bat');
        $this->assertSame(0, $partnerships[0]['balls'], 'No-ball is not a legal partnership ball');
    }

    public function test_per_player_runs_in_partnership(): void
    {
        $balls = BallFactory::collection([
            BallFactory::legal(4),
            BallFactory::make([
                'striker_id' => PlayerIds::NON_STRIKER,
                'non_striker_id' => PlayerIds::STRIKER,
                'runs' => 2,
                'runs_off_bat' => 2,
            ]),
        ]);

        $partnerships = $this->playerStats->partnershipsForInnings(1, $balls);
        $p = $partnerships[0];

        $strikerRuns = $p['player_1_id'] === PlayerIds::STRIKER ? $p['player_1_runs'] : $p['player_2_runs'];
        $nonStrikerRuns = $p['player_1_id'] === PlayerIds::NON_STRIKER ? $p['player_1_runs'] : $p['player_2_runs'];

        $this->assertSame(4, $strikerRuns);
        $this->assertSame(2, $nonStrikerRuns);
    }

    public function test_wide_does_not_increment_striker_balls_in_partnership(): void
    {
        $balls = BallFactory::collection([
            BallFactory::wide(),
            BallFactory::legal(1),
        ]);

        $partnerships = $this->playerStats->partnershipsForInnings(1, $balls);
        $p = $partnerships[0];

        $strikerBalls = $p['player_1_id'] === PlayerIds::STRIKER ? $p['player_1_balls'] : $p['player_2_balls'];
        $this->assertSame(1, $strikerBalls);
    }
}
