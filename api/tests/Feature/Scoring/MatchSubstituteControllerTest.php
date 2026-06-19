<?php

namespace Tests\Feature\Scoring;

use App\Enums\Event\DismissalTypeEnum;
use App\Models\User;
use Tests\Support\Scoring\BuildsScoringMatch;
use Tests\Support\Scoring\ScoresViaApi;
use Tests\TestCase;

/**
 * HTTP tests for batting-side player substitution (MatchSubstituteController).
 */
class MatchSubstituteControllerTest extends TestCase
{
    use BuildsScoringMatch;
    use ScoresViaApi;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpScoringApi();
        $this->seedMatchSquads();
    }

    public function test_forbidden_for_non_staff_user(): void
    {
        $stranger = User::factory()->create(['type' => 'user']);

        $this->actingAs($stranger, 'api')
            ->postJson(
                "/api/v1/matches/{$this->scoringMatch->id}/substitutes",
                $this->substitutePayload(),
            )
            ->assertForbidden();
    }

    public function test_substitute_striker_before_first_ball_updates_pending_crease(): void
    {
        $response = $this->postSubstitute($this->substitutePayload());

        $response->assertOk();
        $response->assertJsonPath('message', 'Substitute recorded.');
        $response->assertJsonPath('data.substitute.replaced_player_id', $this->player(0)->id);
        $response->assertJsonPath('data.substitute.substitute_player_id', $this->player(2)->id);
        $response->assertJsonStructure(['data' => ['match_state']]);

        $pending = $this->scoringMatch->fresh()->pending_crease;
        $this->assertSame($this->player(2)->id, $pending['next_batter_id'] ?? null);

        $this->assertDatabaseHas('match_substitutes', [
            'match_id' => $this->scoringMatch->id,
            'innings_id' => $this->innings1->id,
            'replaced_player_id' => $this->player(0)->id,
            'substitute_player_id' => $this->player(2)->id,
        ]);
    }

    public function test_substitute_after_deliveries_sets_substitute_overlay_pending(): void
    {
        $this->postBall($this->baseBallPayload())->assertCreated();

        $response = $this->postSubstitute($this->substitutePayload());

        $response->assertOk();

        $pending = $this->scoringMatch->fresh()->pending_crease;
        $this->assertSame($this->player(0)->id, $pending['substitute_replaced_id'] ?? null);
        $this->assertSame($this->player(2)->id, $pending['substitute_player_id'] ?? null);
    }

    public function test_rejects_replaced_player_not_on_crease(): void
    {
        $response = $this->postSubstitute($this->substitutePayload(
            replacedPlayerId: $this->player(3)->id,
        ));

        $response->assertUnprocessable();
        $response->assertJsonPath('type', 'VALIDATION_ERROR');
        $response->assertJsonPath('message', 'The replaced player must be on the crease.');
    }

    public function test_rejects_substitute_already_on_crease(): void
    {
        $response = $this->postSubstitute($this->substitutePayload(
            substitutePlayerId: $this->player(1)->id,
        ));

        $response->assertUnprocessable();
        $response->assertJsonPath('message', 'The substitute cannot already be on the crease.');
    }

    public function test_rejects_substitute_who_is_dismissed(): void
    {
        $this->postBall($this->baseBallPayload([
            'is_wicket' => true,
            'dismissal_type' => DismissalTypeEnum::BOWLED->value,
            'out_player_id' => $this->player(0)->id,
        ]))->assertCreated();

        $this->seedPendingCrease(striker: 4, nonStriker: 1);

        $response = $this->postSubstitute($this->substitutePayload(
            replacedPlayerId: $this->player(4)->id,
            substitutePlayerId: $this->player(0)->id,
        ));

        $response->assertUnprocessable();
        $response->assertJsonPath('message', 'The substitute cannot be a dismissed batter.');
    }

    public function test_rejects_innings_not_in_progress(): void
    {
        $this->postEndInnings(['end_reason' => 'captain'])->assertOk();

        $response = $this->postSubstitute($this->substitutePayload());

        $response->assertUnprocessable();
        $response->assertJsonPath('message', 'Substitutions are only allowed during a live innings.');
    }

    /**
     * @return array<string, mixed>
     */
    private function substitutePayload(
        ?int $replacedPlayerId = null,
        ?int $substitutePlayerId = null,
    ): array {
        return [
            'innings_id' => $this->innings1->id,
            'replaced_player_id' => $replacedPlayerId ?? $this->player(0)->id,
            'substitute_player_id' => $substitutePlayerId ?? $this->player(2)->id,
        ];
    }
}
