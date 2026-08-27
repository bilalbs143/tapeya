<?php

namespace Tests\Feature\LiveStream;

use App\Models\LiveStream;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UserOwnedLiveStreamTest extends TestCase
{
    use RefreshDatabase;

    private function user(): User
    {
        return User::factory()->create(['type' => 'user']);
    }

    public function test_store_creates_external_stream_owned_by_user(): void
    {
        $user = $this->user();

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/live/my-streams', [
                'title' => 'Friday Night Live',
                'description' => 'Watch on YouTube',
                'streaming_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            ])
            ->assertCreated()
            ->assertJsonPath('data.title', 'Friday Night Live')
            ->assertJsonPath('data.streaming_url', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
            ->assertJsonPath('data.stream.provider', 'external')
            ->assertJsonPath('data.stream.status', 'idle');

        $this->assertDatabaseHas('live_streams', [
            'owner_user_id' => $user->id,
            'provider' => 'external',
            'title' => 'Friday Night Live',
        ]);
    }

    public function test_store_rejects_non_https_url(): void
    {
        $user = $this->user();

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/live/my-streams', [
                'title' => 'Bad URL',
                'streaming_url' => 'http://example.com/watch',
            ])
            ->assertUnprocessable();
    }

    public function test_index_lists_only_own_external_streams(): void
    {
        $user = $this->user();
        $other = $this->user();

        LiveStream::create([
            'owner_user_id' => $user->id,
            'created_by' => $user->id,
            'title' => 'Mine',
            'streaming_url' => 'https://www.youtube.com/watch?v=mine',
            'provider' => 'external',
            'status' => 'idle',
        ]);

        LiveStream::create([
            'owner_user_id' => $other->id,
            'created_by' => $other->id,
            'title' => 'Theirs',
            'streaming_url' => 'https://www.youtube.com/watch?v=theirs',
            'provider' => 'external',
            'status' => 'idle',
        ]);

        LiveStream::create([
            'owner_user_id' => $user->id,
            'created_by' => $user->id,
            'title' => 'Mobile Go Live',
            'provider' => 'youtube',
            'status' => 'idle',
        ]);

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/live/my-streams')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Mine');
    }

    public function test_start_marks_stream_live_and_appears_on_hub(): void
    {
        $user = $this->user();

        $stream = LiveStream::create([
            'owner_user_id' => $user->id,
            'created_by' => $user->id,
            'title' => 'Go Live Now',
            'streaming_url' => 'https://www.youtube.com/watch?v=testvid12',
            'provider' => 'external',
            'status' => 'idle',
        ]);

        $this->actingAs($user, 'api')
            ->postJson("/api/v1/live/my-streams/{$stream->id}/start")
            ->assertOk()
            ->assertJsonPath('data.status', 'live');

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/live/matches')
            ->assertOk()
            ->assertJsonFragment(['id' => $stream->id]);
    }

    public function test_stranger_cannot_start_or_update(): void
    {
        $owner = $this->user();
        $stranger = $this->user();

        $stream = LiveStream::create([
            'owner_user_id' => $owner->id,
            'created_by' => $owner->id,
            'title' => 'Private',
            'streaming_url' => 'https://www.youtube.com/watch?v=abc',
            'provider' => 'external',
            'status' => 'idle',
        ]);

        $this->actingAs($stranger, 'api')
            ->postJson("/api/v1/live/my-streams/{$stream->id}/start")
            ->assertForbidden();

        $this->actingAs($stranger, 'api')
            ->patchJson("/api/v1/live/my-streams/{$stream->id}", ['title' => 'Hacked'])
            ->assertForbidden();
    }

    public function test_update_and_end(): void
    {
        $user = $this->user();

        $stream = LiveStream::create([
            'owner_user_id' => $user->id,
            'created_by' => $user->id,
            'title' => 'Original',
            'streaming_url' => 'https://www.youtube.com/watch?v=abc',
            'provider' => 'external',
            'status' => 'live',
            'started_at' => now(),
        ]);

        $this->actingAs($user, 'api')
            ->patchJson("/api/v1/live/my-streams/{$stream->id}", [
                'title' => 'Updated',
                'streaming_url' => 'https://www.youtube.com/watch?v=xyz',
            ])
            ->assertOk()
            ->assertJsonPath('data.title', 'Updated')
            ->assertJsonPath('data.streaming_url', 'https://www.youtube.com/watch?v=xyz');

        $this->actingAs($user, 'api')
            ->postJson("/api/v1/live/my-streams/{$stream->id}/end")
            ->assertOk()
            ->assertJsonPath('data.status', 'ended');
    }

    public function test_thumbnail_upload(): void
    {
        Storage::fake('public');

        $user = $this->user();
        $stream = LiveStream::create([
            'owner_user_id' => $user->id,
            'created_by' => $user->id,
            'title' => 'With Thumb',
            'streaming_url' => 'https://www.youtube.com/watch?v=abc',
            'provider' => 'external',
            'status' => 'idle',
        ]);

        $this->actingAs($user, 'api')
            ->postJson("/api/v1/live/my-streams/{$stream->id}/thumbnail", [
                'file' => UploadedFile::fake()->image('thumb.jpg', 360, 185),
            ])
            ->assertOk()
            ->assertJsonStructure(['data' => ['thumbnail_url']]);
    }
}
