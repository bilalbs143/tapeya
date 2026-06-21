<?php

namespace Tests\Feature\Scoring;

use App\Models\User;
use Tests\Support\Scoring\BuildsScoringMatch;
use Tests\Support\Scoring\ScoresViaApi;
use Tests\TestCase;

/**
 * Happy-path HTTP tests for ball storage and server-side field computation.
 */
class ScorecardControllerStoreBallTest extends TestCase
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
                "/api/v1/matches/{$this->scoringMatch->id}/innings/{$this->innings1->id}/balls",
                $this->baseBallPayload(),
            )
            ->assertForbidden();
    }

    public function test_stores_legal_dot_and_returns_match_state(): void
    {
        $response = $this->postBall($this->baseBallPayload());

        $response->assertCreated();
        $response->assertJsonPath('data.ball.runs', 0);
        $response->assertJsonPath('data.ball.is_free_hit', false);
        $response->assertJsonStructure(['data' => ['ball', 'match_state']]);
    }

    public function test_stores_wide_with_automatic_position(): void
    {
        $response = $this->postBall($this->baseBallPayload(['is_wide' => true]));

        $response->assertCreated();
        $response->assertJsonPath('data.ball.runs', 1);
        $response->assertJsonPath('data.ball.over', 0);
    }

    public function test_six_legal_balls_complete_over_in_match_state(): void
    {
        for ($i = 0; $i < 6; $i++) {
            $this->postBall($this->baseBallPayload(['runs_off_bat' => $i === 5 ? 4 : 0]))->assertCreated();
        }

        $response = $this->postBall($this->baseBallPayload());

        $response->assertCreated();
        $response->assertJsonPath('data.match_state.active_innings.overs_display', '1.1');
    }

    public function test_wide_and_no_ball_after_sixth_legal_do_not_advance_legal_count(): void
    {
        for ($i = 0; $i < 6; $i++) {
            $this->postBall($this->baseBallPayload())->assertCreated();
        }

        $this->postBall($this->baseBallPayload(['is_wide' => true]))->assertCreated();
        $this->postBall($this->baseBallPayload([
            'is_no_ball' => true,
            'no_ball_type' => 'over_footed',
            'no_ball_runs_type' => 'from_bat',
        ]))->assertCreated();

        $response = $this->postBall($this->baseBallPayload(['runs_off_bat' => 1]));

        $response->assertJsonPath('data.match_state.active_innings.overs_display', '1.1');
    }
}
