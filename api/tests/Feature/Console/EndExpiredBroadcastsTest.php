<?php

namespace Tests\Feature\Console;

use App\Models\LiveStream;
use App\Models\User;
use App\Streaming\StreamProviderManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Tests\Support\Streaming\FakeStreamProvider;
use Tests\TestCase;

class EndExpiredBroadcastsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->app->make(StreamProviderManager::class)->extend('youtube', fn () => new FakeStreamProvider);
    }

    public function test_case_one_ends_a_self_serve_stream_past_the_max_duration(): void
    {
        $owner = User::factory()->create(['type' => 'user']);
        $stream = LiveStream::factory()->create([
            'match_id' => null,
            'owner_user_id' => $owner->id,
            'provider' => 'youtube',
            'provider_stream_id' => 'fake-broadcast-id',
            'status' => 'live',
            'started_at' => now()->subSeconds(7201),
        ]);

        Artisan::call('broadcasts:end-expired');

        $this->assertSame('ended', $stream->fresh()->status);
    }

    public function test_case_one_leaves_a_stream_within_budget_alone(): void
    {
        $owner = User::factory()->create(['type' => 'user']);
        $stream = LiveStream::factory()->create([
            'match_id' => null,
            'owner_user_id' => $owner->id,
            'provider' => 'youtube',
            'provider_stream_id' => 'fake-broadcast-id',
            'status' => 'live',
            'started_at' => now()->subMinutes(30),
        ]);

        Artisan::call('broadcasts:end-expired');

        $this->assertSame('live', $stream->fresh()->status);
    }

    public function test_case_two_deletes_a_stream_that_never_went_live(): void
    {
        $owner = User::factory()->create(['type' => 'user']);
        $stream = LiveStream::factory()->create([
            'match_id' => null,
            'owner_user_id' => $owner->id,
            'provider' => 'youtube',
            'status' => 'idle',
            'started_at' => null,
            'created_at' => now()->subMinutes(31),
        ]);

        Artisan::call('broadcasts:end-expired');

        $this->assertDatabaseMissing('live_streams', ['id' => $stream->id]);
    }

    public function test_case_two_leaves_a_recently_created_idle_stream_alone(): void
    {
        $owner = User::factory()->create(['type' => 'user']);
        $stream = LiveStream::factory()->create([
            'match_id' => null,
            'owner_user_id' => $owner->id,
            'provider' => 'youtube',
            'status' => 'idle',
            'started_at' => null,
            'created_at' => now()->subMinutes(5),
        ]);

        Artisan::call('broadcasts:end-expired');

        $this->assertDatabaseHas('live_streams', ['id' => $stream->id]);
    }

    public function test_admin_and_match_linked_streams_are_never_touched(): void
    {
        $adminStandalone = LiveStream::factory()->create([
            'match_id' => null,
            'owner_user_id' => null,
            'provider' => 'youtube',
            'status' => 'idle',
            'started_at' => null,
            'created_at' => now()->subDays(1),
        ]);

        Artisan::call('broadcasts:end-expired');

        $this->assertDatabaseHas('live_streams', ['id' => $adminStandalone->id]);
    }

    public function test_external_watch_url_streams_are_not_capped_by_max_duration(): void
    {
        $owner = User::factory()->create(['type' => 'user']);
        $stream = LiveStream::factory()->create([
            'match_id' => null,
            'owner_user_id' => $owner->id,
            'provider' => 'external',
            'streaming_url' => 'https://www.youtube.com/watch?v=abc',
            'status' => 'live',
            'started_at' => now()->subSeconds(7201),
        ]);

        Artisan::call('broadcasts:end-expired');

        $this->assertSame('live', $stream->fresh()->status);
    }
}
