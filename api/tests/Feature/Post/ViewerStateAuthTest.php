<?php

namespace Tests\Feature\Post;

use App\Enums\Post\PostStatusEnum;
use App\Models\Post;
use App\Models\PostComment;
use App\Models\PostCommentLike;
use App\Models\PostLike;
use App\Models\PostSave;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesVideoPosts;
use Tests\TestCase;

class ViewerStateAuthTest extends TestCase
{
    use CreatesVideoPosts;
    use RefreshDatabase;

    private function readyReel(User $owner): Post
    {
        return $this->makeVideoPost($owner, [
            'body' => 'Ready reel',
            'status' => PostStatusEnum::Ready,
            'visibility' => 'public',
            'published_at' => now(),
            'ready_at' => now(),
        ]);
    }

    public function test_authenticated_feed_returns_viewer_liked_and_saved(): void
    {
        $owner = User::factory()->create();
        $viewer = User::factory()->create();
        $reel = $this->readyReel($owner);

        PostLike::query()->create(['post_id' => $reel->id, 'user_id' => $viewer->id]);
        PostSave::query()->create(['post_id' => $reel->id, 'user_id' => $viewer->id]);

        $token = $viewer->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->getJson('/api/v1/feed')->assertOk();
        $item = collect($response->json('data.items'))->firstWhere('id', $reel->id);

        $this->assertNotNull($item);
        $this->assertTrue($item['viewer']['liked']);
        $this->assertTrue($item['viewer']['saved']);
    }

    public function test_authenticated_reel_show_returns_viewer_liked_and_saved(): void
    {
        $owner = User::factory()->create();
        $viewer = User::factory()->create();
        $reel = $this->readyReel($owner);

        PostLike::query()->create(['post_id' => $reel->id, 'user_id' => $viewer->id]);
        PostSave::query()->create(['post_id' => $reel->id, 'user_id' => $viewer->id]);

        $token = $viewer->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/v1/reels/'.$reel->id)
            ->assertOk()
            ->assertJsonPath('data.viewer.liked', true)
            ->assertJsonPath('data.viewer.saved', true);
    }

    public function test_authenticated_comments_return_viewer_liked(): void
    {
        $owner = User::factory()->create();
        $viewer = User::factory()->create();
        $reel = $this->readyReel($owner);

        $comment = PostComment::query()->create([
            'post_id' => $reel->id,
            'user_id' => $owner->id,
            'body' => 'Nice',
            'likes_count' => 1,
        ]);
        PostCommentLike::query()->create([
            'comment_id' => $comment->id,
            'user_id' => $viewer->id,
        ]);

        $token = $viewer->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/v1/posts/'.$reel->id.'/comments')
            ->assertOk()
            ->assertJsonPath('data.items.0.id', $comment->id)
            ->assertJsonPath('data.items.0.liked', true);
    }

    public function test_guest_cannot_access_feed(): void
    {
        $this->getJson('/api/v1/feed')->assertUnauthorized();
    }
}
