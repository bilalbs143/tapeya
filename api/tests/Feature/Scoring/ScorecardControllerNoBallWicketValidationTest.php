<?php

namespace Tests\Feature\Scoring;

use App\Enums\Event\DismissalTypeEnum;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\Scoring\BuildsScoringMatch;
use Tests\Support\Scoring\ScoresViaApi;
use Tests\Support\Scoring\ScoringPropertyGenerator;
use Tests\TestCase;

/**
 * ScorecardController rejects illegal dismissals on no-ball deliveries (Law 21).
 */
class ScorecardControllerNoBallWicketValidationTest extends TestCase
{
    use BuildsScoringMatch;
    use ScoresViaApi;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpScoringApi();
    }

    /**
     * @return array<string, array{0: DismissalTypeEnum}>
     */
    public static function invalidNoBallDismissalsProvider(): array
    {
        $cases = [];
        foreach (DismissalTypeEnum::cases() as $type) {
            if ($type->validOnNoBallDelivery() || $type === DismissalTypeEnum::RETIRED_HURT) {
                continue;
            }
            $cases[$type->value] = [$type];
        }

        return $cases;
    }

    #[DataProvider('invalidNoBallDismissalsProvider')]
    public function test_rejects_invalid_dismissal_on_no_ball(DismissalTypeEnum $type): void
    {
        $payload = $this->baseBallPayload(array_merge(
            ScoringPropertyGenerator::noBallPayloadExtras(),
            [
                'is_wicket' => true,
                'dismissal_type' => $type->value,
                'out_player_id' => $this->player(0)->id,
            ],
            $type->requiresFielder() ? ['fielder_id' => $this->player(5)->id] : [],
        ));

        $response = $this->postBall($payload);

        $response->assertStatus(422);
        $response->assertJsonPath('type', 'VALIDATION_ERROR');
        $this->assertStringContainsString('no-ball delivery', (string) $response->json('message'));
    }

    public function test_accepts_run_out_on_no_ball_without_runs(): void
    {
        $response = $this->postBall($this->baseBallPayload(array_merge(
            ScoringPropertyGenerator::noBallPayloadExtras(),
            [
                'is_wicket' => true,
                'dismissal_type' => DismissalTypeEnum::RUN_OUT->value,
                'out_player_id' => $this->player(0)->id,
                'fielder_id' => $this->player(5)->id,
            ],
        )));

        $response->assertCreated();
        $response->assertJsonPath('data.ball.is_no_ball', true);
    }

    public function test_accepts_run_out_on_no_ball_with_runs_off_bat(): void
    {
        $response = $this->postBall($this->baseBallPayload(array_merge(
            ScoringPropertyGenerator::noBallPayloadExtras(),
            [
                'runs_off_bat' => 2,
                'is_wicket' => true,
                'dismissal_type' => DismissalTypeEnum::RUN_OUT->value,
                'out_player_id' => $this->player(0)->id,
                'fielder_id' => $this->player(5)->id,
            ],
        )));

        $response->assertCreated();
        $response->assertJsonPath('data.ball.runs', 3);
    }
}
