<?php

namespace Tests\Feature\Scoring;

use App\Enums\Event\DismissalTypeEnum;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\Scoring\BuildsScoringMatch;
use Tests\Support\Scoring\ScoringPropertyGenerator;
use Tests\Support\Scoring\ScoresViaApi;
use Tests\TestCase;

/**
 * ScorecardController enforces Law 21.18 free-hit dismissal restrictions.
 */
class ScorecardControllerFreeHitValidationTest extends TestCase
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
    public static function invalidFreeHitDismissalsProvider(): array
    {
        $cases = [];
        foreach (DismissalTypeEnum::cases() as $type) {
            if ($type->validOnFreeHit() || $type === DismissalTypeEnum::RETIRED_HURT) {
                continue;
            }
            $cases[$type->value] = [$type];
        }

        return $cases;
    }

    #[DataProvider('invalidFreeHitDismissalsProvider')]
    public function test_rejects_invalid_dismissal_on_free_hit(DismissalTypeEnum $type): void
    {
        $this->postBall($this->baseBallPayload(ScoringPropertyGenerator::noBallPayloadExtras()))
            ->assertCreated();

        $payload = $this->baseBallPayload([
            'is_wicket' => true,
            'dismissal_type' => $type->value,
            'out_player_id' => $this->player(0)->id,
        ] + ($type->requiresFielder() ? ['fielder_id' => $this->player(5)->id] : []));

        $response = $this->postBall($payload);

        $response->assertStatus(422);
        $response->assertJsonPath('type', 'VALIDATION_ERROR');
        $this->assertStringContainsString('free-hit', (string) $response->json('message'));
    }

    public function test_accepts_run_out_on_free_hit(): void
    {
        $this->postBall($this->baseBallPayload(ScoringPropertyGenerator::noBallPayloadExtras()))
            ->assertCreated();

        $response = $this->postBall($this->baseBallPayload([
            'is_wicket' => true,
            'dismissal_type' => DismissalTypeEnum::RUN_OUT->value,
            'out_player_id' => $this->player(0)->id,
            'fielder_id' => $this->player(5)->id,
        ]));

        $response->assertCreated();
        $response->assertJsonPath('data.ball.is_free_hit', true);
    }

    public function test_server_sets_free_hit_flag_after_no_ball(): void
    {
        $this->postBall($this->baseBallPayload(ScoringPropertyGenerator::noBallPayloadExtras()))
            ->assertCreated();

        $response = $this->postBall($this->baseBallPayload(['runs_off_bat' => 1]));

        $response->assertCreated();
        $response->assertJsonPath('data.ball.is_free_hit', true);
        $response->assertJsonPath('data.match_state.active_innings.next_is_free_hit', false);
    }
}
