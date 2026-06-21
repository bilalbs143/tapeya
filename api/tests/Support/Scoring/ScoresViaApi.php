<?php

namespace Tests\Support\Scoring;

use App\Events\Broadcast\Graphics\MatchGraphicFlashDispatched;
use App\Events\Scoring\MatchStateUpdated;
use App\Jobs\RefreshMatchStatsJob;
use App\Jobs\SyncMatchGraphicContextJob;
use App\Models\Ball;
use App\Models\Innings;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Event;
use Illuminate\Testing\TestResponse;

/**
 * HTTP helpers for ScorecardController feature tests.
 */
trait ScoresViaApi
{
    protected function setUpScoringApi(): void
    {
        Event::fake([MatchStateUpdated::class, MatchGraphicFlashDispatched::class]);
        Bus::fake([RefreshMatchStatsJob::class, SyncMatchGraphicContextJob::class]);
        $this->setUpScoringMatch();
        $this->seedPendingCrease();
    }

    protected function actingAsOrganizer(): static
    {
        return $this->actingAs($this->organizer, 'api');
    }

    protected function seedPendingCrease(?int $striker = 0, ?int $nonStriker = 1, ?int $bowler = 6): void
    {
        $this->scoringMatch->update([
            'pending_crease' => [
                'next_batter_id' => $this->player($striker)->id,
                'next_non_striker_id' => $this->player($nonStriker)->id,
                'next_bowler_id' => $this->player($bowler)->id,
            ],
        ]);
        $this->scoringMatch->refresh();
    }

    /**
     * @param  array<string, mixed>  $override
     * @return array<string, mixed>
     */
    protected function baseBallPayload(array $override = []): array
    {
        return array_merge([
            'striker_id' => $this->player(0)->id,
            'non_striker_id' => $this->player(1)->id,
            'bowler_id' => $this->player(6)->id,
            'runs_off_bat' => 0,
        ], $override);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    protected function postBall(array $payload, ?Innings $innings = null): TestResponse
    {
        $innings ??= $this->innings1;

        return $this->actingAsOrganizer()->postJson(
            "/api/v1/matches/{$this->scoringMatch->id}/innings/{$innings->id}/balls",
            $payload,
        );
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    protected function patchBall(array $payload, Ball $ball, ?Innings $innings = null): TestResponse
    {
        $innings ??= $this->innings1;

        return $this->actingAsOrganizer()->patchJson(
            "/api/v1/matches/{$this->scoringMatch->id}/innings/{$innings->id}/balls/{$ball->id}",
            $payload,
        );
    }

    protected function deleteBallById(Ball $ball, ?Innings $innings = null): TestResponse
    {
        $innings ??= $this->innings1;

        return $this->actingAsOrganizer()->deleteJson(
            "/api/v1/matches/{$this->scoringMatch->id}/innings/{$innings->id}/balls/{$ball->id}",
        );
    }

    protected function deleteLastBall(?Innings $innings = null): TestResponse
    {
        $innings ??= $this->innings1;

        return $this->actingAsOrganizer()->deleteJson(
            "/api/v1/matches/{$this->scoringMatch->id}/innings/{$innings->id}/balls/last",
        );
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    protected function postEndInnings(array $payload, ?Innings $innings = null): TestResponse
    {
        $innings ??= $this->innings1;

        return $this->actingAsOrganizer()->postJson(
            "/api/v1/matches/{$this->scoringMatch->id}/innings/{$innings->id}/end",
            $payload,
        );
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    protected function postSubstitute(array $payload): TestResponse
    {
        return $this->actingAsOrganizer()->postJson(
            "/api/v1/matches/{$this->scoringMatch->id}/substitutes",
            $payload,
        );
    }

    protected function assertValidationFailure(TestResponse $response, ?string $messageContains = null): void
    {
        $response->assertJsonPath('type', 'VALIDATION_ERROR');
        if ($messageContains !== null) {
            $response->assertJsonFragment(['message' => $messageContains]);
        }
    }
}
