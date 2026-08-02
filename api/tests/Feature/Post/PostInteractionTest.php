<?php

namespace Tests\Feature\Post;

use App\Enums\Post\PostStatusEnum;
use App\Models\Post;
use App\Models\PostComment;
use App\Models\User;
use App\Models\UserFollow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesVideoPosts;
use Tests\TestCase;

class PostInteractionTest extends TestCase
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

    public function test_user_can_like_and_unlike_reel(): void
    {
        $owner = User::factory()->create();
        $viewer = User::factory()->create();
        $reel = $this->readyReel($owner);

        $this->actingAs($viewer, 'api')
            ->postJson('/api/v1/reels/'.$reel->id.'/like')
            ->assertOk()
            ->assertJsonPath('data.liked', true)
            ->assertJsonPath('data.likes_count', 1);

        $this->actingAs($viewer, 'api')
            ->deleteJson('/api/v1/reels/'.$reel->id.'/like')
            ->assertOk()
            ->assertJsonPath('data.liked', false)
            ->assertJsonPath('data.likes_count', 0);
    }

    public function test_posts_engagement_aliases_match_reels_routes(): void
    {
        $owner = User::factory()->create();
        $viewer = User::factory()->create();
        $post = $this->readyReel($owner);

        $this->actingAs($viewer, 'api')
            ->postJson('/api/v1/posts/'.$post->id.'/like')
            ->assertOk()
            ->assertJsonPath('data.liked', true)
            ->assertJsonPath('data.likes_count', 1);

        $this->actingAs($viewer, 'api')
            ->postJson('/api/v1/posts/'.$post->id.'/save')
            ->assertOk()
            ->assertJsonPath('data.saved', true);

        $this->actingAs($viewer, 'api')
            ->postJson('/api/v1/posts/'.$post->id.'/share', ['channel' => 'copy_link'])
            ->assertOk()
            ->assertJsonPath('data.shares_count', 1);

        $this->actingAs($viewer, 'api')
            ->postJson('/api/v1/posts/'.$post->id.'/comments', ['body' => 'Alias path works'])
            ->assertCreated()
            ->assertJsonPath('data.body', 'Alias path works');

        $this->actingAs($viewer, 'api')
            ->getJson('/api/v1/posts/'.$post->id.'/comments')
            ->assertOk()
            ->assertJsonPath('data.items.0.body', 'Alias path works');
    }

    public function test_user_can_comment_and_reply_one_level(): void
    {
        $owner = User::factory()->create();
        $viewer = User::factory()->create();
        $reel = $this->readyReel($owner);

        $top = $this->actingAs($viewer, 'api')
            ->postJson('/api/v1/reels/'.$reel->id.'/comments', ['body' => 'Great shot'])
            ->assertCreated()
            ->json('data');

        $this->actingAs($viewer, 'api')
            ->postJson('/api/v1/reels/'.$reel->id.'/comments', [
                'body' => 'Agreed',
                'parent_id' => $top['id'],
            ])
            ->assertCreated()
            ->assertJsonPath('data.parent_id', $top['id']);

        $nestedParent = PostComment::query()->where('parent_id', $top['id'])->first();

        $this->actingAs($viewer, 'api')
            ->postJson('/api/v1/reels/'.$reel->id.'/comments', [
                'body' => 'Too deep',
                'parent_id' => $nestedParent->id,
            ])
            ->assertJsonPath('type', 'VALIDATION_ERROR');
    }

    public function test_comment_pagination_is_stable_when_created_at_ties(): void
    {
        $owner = User::factory()->create();
        $viewer = User::factory()->create();
        $reel = $this->readyReel($owner);
        $tiedAt = now()->subMinute();

        foreach (range(1, 5) as $i) {
            $comment = PostComment::query()->create([
                'post_id' => $reel->id,
                'user_id' => $viewer->id,
                'body' => "Comment {$i}",
            ]);
            $comment->forceFill([
                'created_at' => $tiedAt,
                'updated_at' => $tiedAt,
            ])->save();
        }

        $reel->forceFill(['comments_count' => 5])->save();

        $page1 = $this->actingAs($viewer, 'api')
            ->getJson('/api/v1/reels/'.$reel->id.'/comments?page=1&per_page=2')
            ->assertOk()
            ->json('data');

        $page2 = $this->actingAs($viewer, 'api')
            ->getJson('/api/v1/reels/'.$reel->id.'/comments?page=2&per_page=2')
            ->assertOk()
            ->json('data');

        $page3 = $this->actingAs($viewer, 'api')
            ->getJson('/api/v1/reels/'.$reel->id.'/comments?page=3&per_page=2')
            ->assertOk()
            ->json('data');

        $ids = collect([$page1['items'], $page2['items'], $page3['items']])
            ->flatten(1)
            ->pluck('id')
            ->all();

        $this->assertCount(5, $ids);
        $this->assertSame($ids, array_values(array_unique($ids)));
        $this->assertSame(array_values(collect($ids)->sortDesc()->values()->all()), $ids);
    }

    public function test_deleting_parent_comment_cascades_replies_and_recounts(): void
    {
        $owner = User::factory()->create();
        $viewer = User::factory()->create();
        $reel = $this->readyReel($owner);

        $top = $this->actingAs($viewer, 'api')
            ->postJson('/api/v1/reels/'.$reel->id.'/comments', ['body' => 'Parent'])
            ->assertCreated()
            ->json('data');

        $this->actingAs($viewer, 'api')
            ->postJson('/api/v1/reels/'.$reel->id.'/comments', [
                'body' => 'Reply A',
                'parent_id' => $top['id'],
            ])
            ->assertCreated();

        $this->actingAs($viewer, 'api')
            ->postJson('/api/v1/reels/'.$reel->id.'/comments', [
                'body' => 'Reply B',
                'parent_id' => $top['id'],
            ])
            ->assertCreated();

        $this->assertSame(3, $reel->fresh()->comments_count);

        $this->actingAs($viewer, 'api')
            ->deleteJson('/api/v1/reels/'.$reel->id.'/comments/'.$top['id'])
            ->assertOk();

        $this->assertSame(0, $reel->fresh()->comments_count);
        $this->assertSame(0, PostComment::query()->where('post_id', $reel->id)->count());
        $this->assertSame(3, PostComment::withTrashed()->where('post_id', $reel->id)->count());
    }

    public function test_following_feed_only_shows_followed_creators(): void
    {
        $viewer = User::factory()->create();
        $followed = User::factory()->create();
        $other = User::factory()->create();

        UserFollow::query()->create([
            'follower_id' => $viewer->id,
            'followed_user_id' => $followed->id,
        ]);

        $this->readyReel($followed)->update(['body' => 'From followed']);
        $this->readyReel($other)->update(['body' => 'From stranger']);

        $response = $this->actingAs($viewer, 'api')->getJson('/api/v1/reels/feed/following');

        $response->assertOk();
        $captions = collect($response->json('data.items'))->pluck('body')->all();
        $this->assertContains('From followed', $captions);
        $this->assertNotContains('From stranger', $captions);
    }

    public function test_user_can_list_liked_reels(): void
    {
        $owner = User::factory()->create();
        $viewer = User::factory()->create();
        $liked = $this->readyReel($owner);
        $this->readyReel($owner);

        $this->actingAs($viewer, 'api')
            ->postJson('/api/v1/reels/'.$liked->id.'/like')
            ->assertOk();

        $response = $this->actingAs($viewer, 'api')
            ->getJson('/api/v1/reels/liked')
            ->assertOk();

        $ids = collect($response->json('data.items'))->pluck('id')->all();
        $this->assertContains($liked->id, $ids);
        $this->assertCount(1, $ids);
    }

    public function test_user_can_report_reel_once(): void
    {
        $owner = User::factory()->create();
        $viewer = User::factory()->create();
        $reel = $this->readyReel($owner);

        $this->actingAs($viewer, 'api')
            ->postJson('/api/v1/reels/'.$reel->id.'/report', [
                'reason' => 'spam',
                'details' => 'Looks like spam',
            ])
            ->assertOk()
            ->assertJsonPath('data.reported', true)
            ->assertJsonPath('data.reports_count', 1);

        $this->actingAs($viewer, 'api')
            ->postJson('/api/v1/reels/'.$reel->id.'/report', [
                'reason' => 'spam',
            ])
            ->assertOk()
            ->assertJsonPath('data.already_reported', true)
            ->assertJsonPath('data.reports_count', 1);
    }
}
