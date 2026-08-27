<?php

namespace Tests\Unit\Streaming;

use App\Models\LiveStream;
use App\Settings\StreamingSettings;
use App\Streaming\Support\LiveStreamStatusTransition;
use Carbon\Carbon;
use Tests\TestCase;

class LiveStreamStatusTransitionTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow('2026-06-30 12:00:00');

        $settings = \Mockery::mock(StreamingSettings::class);
        $settings->idleEndGraceMinutes = 120;
        $this->instance(StreamingSettings::class, $settings);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    /**
     * @param  array<string, mixed>  $attrs
     */
    private function stream(array $attrs = []): LiveStream
    {
        return new LiveStream(array_merge([
            'status' => 'idle',
            'provider_metadata' => [],
        ], $attrs));
    }

    public function test_live_encoder_disconnect_moves_to_idle_without_ending(): void
    {
        $stream = $this->stream([
            'status' => 'live',
            'started_at' => now()->subMinutes(10),
        ]);

        $updates = LiveStreamStatusTransition::resolve($stream, 'idle');

        $this->assertNotNull($updates);
        $this->assertSame('idle', $updates['status']);
        $this->assertArrayHasKey('idle_since', $updates['provider_metadata']);
        $this->assertArrayNotHasKey('ended_at', $updates);
    }

    public function test_idle_grace_elapsed_auto_ends(): void
    {
        $stream = $this->stream([
            'status' => 'idle',
            'started_at' => now()->subHours(3),
            'provider_metadata' => [
                'idle_since' => now()->subMinutes(121)->toIso8601String(),
            ],
        ]);

        $updates = LiveStreamStatusTransition::resolve($stream, 'idle');

        $this->assertNotNull($updates);
        $this->assertSame('ended', $updates['status']);
        $this->assertNotNull($updates['ended_at']);
    }

    public function test_idle_within_grace_stays_idle(): void
    {
        $stream = $this->stream([
            'status' => 'idle',
            'provider_metadata' => [
                'idle_since' => now()->subMinutes(30)->toIso8601String(),
            ],
        ]);

        $this->assertNull(LiveStreamStatusTransition::resolve($stream, 'idle'));
    }

    public function test_reconnect_clears_idle_since_and_returns_live(): void
    {
        $stream = $this->stream([
            'status' => 'idle',
            'started_at' => now()->subHour(),
            'provider_metadata' => [
                'idle_since' => now()->subMinutes(15)->toIso8601String(),
            ],
        ]);

        $updates = LiveStreamStatusTransition::resolve($stream, 'live');

        $this->assertSame('live', $updates['status']);
        $this->assertArrayNotHasKey('idle_since', $updates['provider_metadata']);
    }

    public function test_never_live_idle_session_does_not_auto_end(): void
    {
        $stream = $this->stream([
            'status' => 'idle',
            'provider_metadata' => [],
        ]);

        $this->assertNull(LiveStreamStatusTransition::resolve($stream, 'idle'));
    }

    public function test_owner_publishing_grace_blocks_youtube_idle_downgrade(): void
    {
        $stream = $this->stream([
            'status' => 'live',
            'owner_user_id' => 42,
            'started_at' => now(),
            'provider_metadata' => [
                'owner_publishing_since' => now()->subMinute()->toIso8601String(),
            ],
        ]);

        $this->assertNull(LiveStreamStatusTransition::resolve($stream, 'idle'));
    }

    public function test_owner_publishing_grace_expires_allows_idle_downgrade(): void
    {
        $stream = $this->stream([
            'status' => 'live',
            'owner_user_id' => 42,
            'started_at' => now()->subMinutes(10),
            'provider_metadata' => [
                'owner_publishing_since' => now()->subMinutes(6)->toIso8601String(),
            ],
        ]);

        $updates = LiveStreamStatusTransition::resolve($stream, 'idle');

        $this->assertNotNull($updates);
        $this->assertSame('idle', $updates['status']);
    }

    public function test_owner_publishing_grace_blocks_youtube_starting_downgrade(): void
    {
        $stream = $this->stream([
            'status' => 'live',
            'owner_user_id' => 42,
            'started_at' => now(),
            'provider_metadata' => [
                'owner_publishing_since' => now()->subMinute()->toIso8601String(),
            ],
        ]);

        $this->assertNull(LiveStreamStatusTransition::resolve($stream, 'starting'));
    }
}
