<?php

namespace Tests\Feature\Scoring;

use App\Models\Ball;
use App\Models\User;
use Tests\Support\Scoring\BuildsScoringMatch;
use Tests\Support\Scoring\ScoresViaApi;
use Tests\TestCase;

/**
 * HTTP tests for correcting and undoing deliveries via updateBall / deleteBall / deleteLastBall.
 */
class ScorecardControllerUpdateDeleteBallTest extends TestCase
{
    use BuildsScoringMatch;
    use ScoresViaApi;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpScoringApi();
    }

    public function test_forbidden_update_for_non_staff_user(): void
    {
        $ball = $this->storeDotBall();
        $stranger = User::factory()->create(['type' => 'user']);

        $this->actingAs($stranger, 'api')
            ->patchJson(
                "/api/v1/matches/{$this->scoringMatch->id}/innings/{$this->innings1->id}/balls/{$ball->id}",
                ['runs_off_bat' => 4],
            )
            ->assertForbidden();
    }

    public function test_forbidden_delete_for_non_staff_user(): void
    {
        $ball = $this->storeDotBall();
        $stranger = User::factory()->create(['type' => 'user']);

        $this->actingAs($stranger, 'api')
            ->deleteJson(
                "/api/v1/matches/{$this->scoringMatch->id}/innings/{$this->innings1->id}/balls/{$ball->id}",
            )
            ->assertForbidden();
    }

    public function test_updates_runs_off_bat_and_recomputes_total(): void
    {
        $ball = $this->storeDotBall();

        $response = $this->patchBall(['runs_off_bat' => 4], $ball);

        $response->assertOk();
        $response->assertJsonPath('data.ball.runs', 4);
        $response->assertJsonPath('data.ball.runs_off_bat', 4);
        $response->assertJsonPath('data.match_state.active_innings.total_runs', 4);
    }

    public function test_deletes_ball_by_id_and_updates_match_state(): void
    {
        $first = $this->storeDotBall();
        $this->postBall($this->baseBallPayload(['runs_off_bat' => 2]))->assertCreated();

        $response = $this->deleteBallById($first);

        $response->assertOk();
        $response->assertJsonPath('data.match_state.active_innings.total_runs', 2);
        $this->assertSame(1, Ball::query()->where('innings_id', $this->innings1->id)->count());
    }

    public function test_delete_last_ball_removes_most_recent_delivery(): void
    {
        $this->storeDotBall();
        $this->postBall($this->baseBallPayload(['runs_off_bat' => 3]))->assertCreated();

        $response = $this->deleteLastBall();

        $response->assertOk();
        $response->assertJsonPath('data.match_state.active_innings.total_runs', 0);
        $this->assertSame(1, Ball::query()->where('innings_id', $this->innings1->id)->count());
    }

    public function test_delete_last_ball_when_empty_returns_not_found(): void
    {
        $response = $this->deleteLastBall();

        $response->assertNotFound();
        $response->assertJsonPath('type', 'NOT_FOUND');
    }

    private function storeDotBall(): Ball
    {
        $response = $this->postBall($this->baseBallPayload());
        $response->assertCreated();

        return Ball::query()->findOrFail((int) $response->json('data.ball.id'));
    }
}
