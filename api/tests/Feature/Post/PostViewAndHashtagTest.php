<?php

namespace Tests\Feature\Post;

use App\Enums\Post\PostStatusEnum;
use App\Models\Hashtag;
use App\Models\Post;
use App\Models\User;
use App\Services\Post\PostHashtagParser;
use Database\Seeders\SystemSettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesVideoPosts;
use Tests\TestCase;

class PostViewAndHashtagTest extends TestCase
{
    use CreatesVideoPosts;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(SystemSettingsSeeder::class);
    }

    private function readyReel(User $owner, array $overrides = []): Post
    {
        return $this->makeVideoPost($owner, array_merge([
            'body' => 'What a cover #cricket #tapeya',
            'status' => PostStatusEnum::Ready,
            'visibility' => 'public',
            'published_at' => now(),
            'ready_at' => now(),
            'duration_ms' => 15000,
            'likes_count' => 0,
            'comments_count' => 0,
            'shares_count' => 0,
            'views_count' => 0,
        ], $overrides));
    }

    public function test_view_is_counted_once_after_threshold(): void
    {
        $owner = User::factory()->create();
        $viewer = User::factory()->create();
        $reel = $this->readyReel($owner);

        $this->actingAs($viewer, 'api')
            ->postJson('/api/v1/posts/'.$reel->id.'/views', [
                'watched_ms' => 1000,
                'completion_rate' => 0.05,
            ])
            ->assertOk()
            ->assertJsonPath('data.counted', false)
            ->assertJsonPath('data.views_count', 0);

        $this->actingAs($viewer, 'api')
            ->postJson('/api/v1/posts/'.$reel->id.'/views', [
                'watched_ms' => 3500,
                'completion_rate' => 0.2,
            ])
            ->assertOk()
            ->assertJsonPath('data.counted', true)
            ->assertJsonPath('data.views_count', 1);

        $this->actingAs($viewer, 'api')
            ->postJson('/api/v1/posts/'.$reel->id.'/views', [
                'watched_ms' => 8000,
                'completion_rate' => 0.5,
            ])
            ->assertOk()
            ->assertJsonPath('data.already_counted', true)
            ->assertJsonPath('data.views_count', 1);
    }

    public function test_processing_reel_views_are_counted(): void
    {
        $owner = User::factory()->create();
        $viewer = User::factory()->create();
        $reel = $this->readyReel($owner, [
            'status' => PostStatusEnum::Processing,
            'ready_at' => null,
        ]);

        $this->actingAs($viewer, 'api')
            ->postJson('/api/v1/posts/'.$reel->id.'/views', [
                'watched_ms' => 3500,
                'completion_rate' => 0.3,
            ])
            ->assertOk()
            ->assertJsonPath('data.counted', true)
            ->assertJsonPath('data.views_count', 1);

        $this->assertSame(1, (int) $reel->fresh()->views_count);
    }

    public function test_creating_reel_syncs_hashtags(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'api')->postJson('/api/v1/reels', [
            'body' => 'Six over midwicket #Cricket #SIX',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('hashtags', ['name' => 'cricket']);
        $this->assertDatabaseHas('hashtags', ['name' => 'six']);
        $this->assertSame(1, Hashtag::query()->where('name', 'cricket')->value('posts_count'));
    }

    public function test_trending_and_hashtag_reels_endpoints(): void
    {
        $owner = User::factory()->create();
        $hot = $this->readyReel($owner, [
            'body' => 'Hot #cricket',
            'likes_count' => 50,
            'comments_count' => 10,
            'shares_count' => 5,
            'views_count' => 1000,
        ]);
        app(PostHashtagParser::class)->syncForPost($hot);

        $this->getJson('/api/v1/reels/trending')
            ->assertOk()
            ->assertJsonPath('data.items.0.id', $hot->id);

        $this->getJson('/api/v1/hashtags/search?q=cri')
            ->assertOk()
            ->assertJsonPath('data.0.name', 'cricket');

        $this->getJson('/api/v1/hashtags/cricket/reels')
            ->assertOk()
            ->assertJsonPath('data.items.0.id', $hot->id);
    }

    public function test_search_reels_by_caption(): void
    {
        $owner = User::factory()->create();
        $this->readyReel($owner, ['body' => 'Unique yorker delivery']);

        $this->getJson('/api/v1/reels/search?q=yorker')
            ->assertOk()
            ->assertJsonPath('data.items.0.caption', 'Unique yorker delivery');
    }
}
