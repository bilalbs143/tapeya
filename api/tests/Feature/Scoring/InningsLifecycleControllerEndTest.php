<?php

namespace Tests\Feature\Scoring;

use App\Enums\Event\InningsEndReasonEnum;
use App\Enums\Event\InningsStatusEnum;
use App\Models\User;
use Tests\Support\Scoring\BuildsScoringMatch;
use Tests\Support\Scoring\ScoresViaApi;
use Tests\TestCase;

/**
 * HTTP tests for manual innings end (InningsLifecycleController).
 */
class InningsLifecycleControllerEndTest extends TestCase
{
    use BuildsScoringMatch;
    use ScoresViaApi;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpScoringApi();
    }

    public function test_forbidden_for_non_staff_user(): void
    {
        $stranger = User::factory()->create(['type' => 'user']);

        $this->actingAs($stranger, 'api')
            ->postJson(
                "/api/v1/matches/{$this->scoringMatch->id}/innings/{$this->innings1->id}/end",
                ['end_reason' => InningsEndReasonEnum::CAPTAIN->value],
            )
            ->assertForbidden();
    }

    public function test_captain_end_innings_with_zero_balls(): void
    {
        $response = $this->postEndInnings([
            'end_reason' => InningsEndReasonEnum::CAPTAIN->value,
            'end_comments' => 'Declared',
        ]);

        $response->assertOk();
        $response->assertJsonPath('message', 'Innings ended.');
        $response->assertJsonStructure(['data' => ['match_state']]);
        $response->assertJsonPath('data.match_state.innings_just_completed', 1);

        $this->assertSame(
            InningsStatusEnum::COMPLETED,
            $this->innings1->fresh()->status,
        );
        $this->assertSame(
            InningsEndReasonEnum::CAPTAIN->value,
            $this->innings1->fresh()->end_reason?->value,
        );
        $this->assertSame('Declared', $this->innings1->fresh()->end_comments);
    }

    public function test_all_out_requires_at_least_one_ball(): void
    {
        $response = $this->postEndInnings([
            'end_reason' => InningsEndReasonEnum::ALL_OUT->value,
        ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['end_reason']);
        $this->assertSame(InningsStatusEnum::IN_PROGRESS, $this->innings1->fresh()->status);
    }

    public function test_all_out_after_deliveries_completes_innings(): void
    {
        $this->postBall($this->baseBallPayload())->assertCreated();

        $response = $this->postEndInnings([
            'end_reason' => InningsEndReasonEnum::ALL_OUT->value,
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.match_state.innings_just_completed', 1);
        $this->assertSame(InningsStatusEnum::COMPLETED, $this->innings1->fresh()->status);
        $this->assertSame(
            InningsEndReasonEnum::ALL_OUT->value,
            $this->innings1->fresh()->end_reason?->value,
        );
    }

    public function test_conflict_when_innings_already_completed(): void
    {
        $this->postEndInnings(['end_reason' => InningsEndReasonEnum::REFEREE->value])->assertOk();

        $this->postEndInnings(['end_reason' => InningsEndReasonEnum::RAIN->value])
            ->assertConflict()
            ->assertJsonPath('message', 'Innings is already completed.');
    }

    public function test_rejects_invalid_end_reason(): void
    {
        $response = $this->postEndInnings(['end_reason' => 'not_a_reason']);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['end_reason']);
    }
}
