<?php

namespace Tests\Unit\Services\Scoring;

use App\Enums\Event\DismissalTypeEnum;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\Scoring\BallFactory;
use Tests\Support\Scoring\PlayerIds;

/**
 * Every dismissal type must produce correct wicket/bowler/partnership behaviour.
 */
class InningsStatsServiceDismissalTypesTest extends ScoringUnitTestCase
{
    /**
     * @return array<string, array{0: DismissalTypeEnum}>
     */
    public static function allDismissalTypesProvider(): array
    {
        $cases = [];
        foreach (DismissalTypeEnum::cases() as $type) {
            $cases[$type->value] = [$type];
        }

        return $cases;
    }

    #[DataProvider('allDismissalTypesProvider')]
    public function test_dismissal_counts_as_wicket_matches_enum(DismissalTypeEnum $type): void
    {
        $balls = [
            BallFactory::wicket($type, PlayerIds::STRIKER, extra: ['fielder_id' => PlayerIds::FIELDER]),
            BallFactory::legal(0, PlayerIds::INCOMING, PlayerIds::NON_STRIKER),
        ];

        $stats = $this->compute($balls);

        $this->assertSame(
            $type->countsAsWicket() ? 1 : 0,
            $stats['total_wickets'],
            "Wicket count mismatch for {$type->value}",
        );
    }

    #[DataProvider('allDismissalTypesProvider')]
    public function test_dismissal_bowler_credit_matches_enum(DismissalTypeEnum $type): void
    {
        $balls = [
            BallFactory::wicket($type, PlayerIds::STRIKER, extra: ['fielder_id' => PlayerIds::FIELDER]),
        ];

        $stats = $this->compute($balls);

        $this->assertSame(
            $type->countsAsBowlerWicket() ? 1 : 0,
            $stats['bowling_by_id'][PlayerIds::BOWLER]['wickets'],
            "Bowler credit mismatch for {$type->value}",
        );
    }

    #[DataProvider('allDismissalTypesProvider')]
    public function test_dismissal_recorded_on_batting_card(DismissalTypeEnum $type): void
    {
        $balls = [
            BallFactory::wicket($type, PlayerIds::STRIKER, extra: ['fielder_id' => PlayerIds::FIELDER]),
        ];

        $stats = $this->compute($balls);
        $bat = $stats['batting_by_id'][PlayerIds::STRIKER];

        $this->assertSame($type->value, $bat['dismissal_type']);
    }
}
