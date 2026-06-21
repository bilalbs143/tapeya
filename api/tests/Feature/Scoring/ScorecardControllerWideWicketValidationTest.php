<?php

namespace Tests\Feature\Scoring;

use App\Enums\Event\DismissalTypeEnum;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\Scoring\BuildsScoringMatch;
use Tests\Support\Scoring\ScoresViaApi;
use Tests\TestCase;

/**
 * ScorecardController rejects illegal dismissals on wide deliveries (Law 37).
 */
class ScorecardControllerWideWicketValidationTest extends TestCase
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
    public static function invalidWideDismissalsProvider(): array
    {
        $cases = [];
        foreach (DismissalTypeEnum::cases() as $type) {
            if ($type->validOnWideDelivery() || $type === DismissalTypeEnum::RETIRED_HURT) {
                continue;
            }
            $cases[$type->value] = [$type];
        }

        return $cases;
    }

    #[DataProvider('invalidWideDismissalsProvider')]
    public function test_rejects_invalid_dismissal_on_wide(DismissalTypeEnum $type): void
    {
        $payload = $this->baseBallPayload(array_merge([
            'is_wide' => true,
            'is_wicket' => true,
            'dismissal_type' => $type->value,
            'out_player_id' => $this->player(0)->id,
        ], $type->requiresFielder() ? ['fielder_id' => $this->player(5)->id] : []));

        $response = $this->postBall($payload);

        $response->assertStatus(422);
        $response->assertJsonPath('type', 'VALIDATION_ERROR');
        $this->assertStringContainsString('wide delivery', (string) $response->json('message'));
    }

    public function test_accepts_run_out_on_wide(): void
    {
        $response = $this->postBall($this->baseBallPayload([
            'is_wide' => true,
            'is_wicket' => true,
            'dismissal_type' => DismissalTypeEnum::RUN_OUT->value,
            'out_player_id' => $this->player(0)->id,
            'fielder_id' => $this->player(5)->id,
        ]));

        $response->assertCreated();
        $response->assertJsonPath('data.ball.is_wicket', true);
    }

    public function test_accepts_stumped_on_wide(): void
    {
        $response = $this->postBall($this->baseBallPayload([
            'is_wide' => true,
            'is_wicket' => true,
            'dismissal_type' => DismissalTypeEnum::STUMPED->value,
            'out_player_id' => $this->player(0)->id,
            'fielder_id' => $this->player(5)->id,
        ]));

        $response->assertCreated();
    }

    public function test_accepts_obstructing_the_field_on_wide(): void
    {
        $response = $this->postBall($this->baseBallPayload([
            'is_wide' => true,
            'is_wicket' => true,
            'dismissal_type' => DismissalTypeEnum::OBSTRUCTING_THE_FIELD->value,
            'out_player_id' => $this->player(0)->id,
        ]));

        $response->assertCreated();
        $response->assertJsonPath('data.ball.is_wicket', true);
        $response->assertJsonPath('data.ball.dismissal_type', DismissalTypeEnum::OBSTRUCTING_THE_FIELD->value);
    }
}
