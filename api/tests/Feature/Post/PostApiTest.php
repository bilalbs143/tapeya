<?php

namespace Tests\Feature\Post;

use App\Enums\Post\PostStatusEnum;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesVideoPosts;
use Tests\TestCase;

class PostApiTest extends TestCase
{
    use CreatesVideoPosts;
    use RefreshDatabase;

    public function test_authenticated_user_can_create_reel_shell(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'api')->postJson('/api/v1/reels', [
            'body' => 'Cover drive #cricket',
            'visibility' => 'public',
            'client_duration_ms' => 12000,
        ]);

        $response->assertCreated()
            ->assertJsonPath('type', 'CREATED')
            ->assertJsonPath('data.caption', 'Cover drive #cricket')
            ->assertJsonPath('data.status', 'uploading')
            ->assertJsonPath('data.upload.type', 'reel')
            ->assertJsonPath('data.upload.field', 'original');

        $this->assertDatabaseHas('posts', [
            'user_id' => $user->id,
            'status' => PostStatusEnum::Uploading->value,
            'body' => 'Cover drive #cricket',
        ]);
    }

    public function test_owner_can_list_mine_including_processing(): void
    {
        $user = User::factory()->create();

        $this->makeVideoPost($user, [
            'body' => 'Mine',
            'status' => PostStatusEnum::Processing,
            'published_at' => now(),
        ]);

        $this->makeVideoPost($user, [
            'body' => 'Still uploading',
            'status' => PostStatusEnum::Uploading,
            'published_at' => null,
        ]);

        $response = $this->actingAs($user, 'api')->getJson('/api/v1/reels/mine');

        $response->assertOk()
            ->assertJsonPath('type', 'SUCCESS')
            ->assertJsonPath('data.items.0.caption', 'Mine')
            ->assertJsonPath('data.items.0.status', 'processing');

        $captions = collect($response->json('data.items'))->pluck('caption')->all();
        $this->assertContains('Mine', $captions);
        $this->assertNotContains('Still uploading', $captions);
    }

    public function test_owner_mine_exposes_original_playback_while_processing(): void
    {
        $user = User::factory()->create();

        $this->makeVideoPost($user, [
            'body' => 'Encoding now',
            'status' => PostStatusEnum::Processing,
            'published_at' => now(),
            'original_path' => 'posts/videos/original/19/clip.mp4',
            'hls_master_path' => null,
        ]);

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/reels/mine')
            ->assertOk()
            ->assertJsonPath('data.items.0.caption', 'Encoding now')
            ->assertJsonPath('data.items.0.playback.type', 'original')
            ->assertJsonPath('data.items.0.playback.is_processed', false)
            ->assertJsonPath('data.items.0.playback.url', fn ($url) => is_string($url) && str_contains($url, 'original'));
    }

    public function test_non_owner_cannot_delete_reel(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();

        $reel = $this->makeVideoPost($owner, [
            'body' => 'Nope',
            'status' => PostStatusEnum::Ready,
            'published_at' => now(),
            'ready_at' => now(),
        ]);

        $this->actingAs($other, 'api')
            ->deleteJson('/api/v1/reels/'.$reel->id)
            ->assertJsonPath('type', 'FORBIDDEN');
    }
}
