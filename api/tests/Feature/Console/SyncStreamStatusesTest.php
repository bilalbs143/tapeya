<?php

namespace Tests\Feature\Console;

use App\Models\MatchStream;
use App\Streaming\StreamProviderManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Tests\Support\Streaming\CreatesTestMatch;
use Tests\Support\Streaming\FakeStreamProvider;
use Tests\TestCase;

/**
 * Regression coverage for the Phase 1 blocker: `streams:sync` used to call
 * $resolver->forMatch($stream->match) unconditionally, which NPEs once a
 * standalone (match_id = null) row exists in the table.
 */
class SyncStreamStatusesTest extends TestCase
{
    use CreatesTestMatch;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->app->make(StreamProviderManager::class)->extend('youtube', fn () => new FakeStreamProvider);
    }

    public function test_sync_command_updates_youtube_stream_without_npe_alongside_standalone_row(): void
    {
        MatchStream::factory()->create([
            'match_id' => null,
            'provider' => 'external',
            'status' => 'live',
        ]);

        $match = $this->createMatch();
        $youtubeStream = MatchStream::factory()->create([
            'match_id' => $match->id,
            'provider' => 'youtube',
            'provider_stream_id' => 'fake-broadcast-id',
            'status' => 'starting',
        ]);

        Artisan::call('streams:sync');

        $youtubeStream->refresh();
        $this->assertSame('live', $youtubeStream->status);
    }

    public function test_sync_command_skips_external_rows_even_if_provider_stream_id_is_set(): void
    {
        $stream = MatchStream::factory()->create([
            'match_id' => null,
            'provider' => 'external',
            'provider_stream_id' => 'unexpected-id',
            'status' => 'live',
        ]);

        Artisan::call('streams:sync');

        $stream->refresh();
        $this->assertSame('live', $stream->status);
    }
}
