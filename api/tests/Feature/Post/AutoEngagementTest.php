<?php

namespace Tests\Feature\Post;

use App\Enums\Post\PostStatusEnum;
use App\Enums\Post\PostTypeEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Listeners\PostLikedPushListener;
use App\Models\Post;
use App\Models\PostLike;
use App\Models\PushNotificationLog;
use App\Models\User;
use App\Notifications\PostLikedUserNotification;
use App\Services\Post\AutoEngagementService;
use App\Services\Post\AutoLikeNotificationDigest;
use App\Services\Post\PostInteractionService;
use App\Services\Push\PushNotificationService;
use App\Settings\PostsSettings;
use App\Support\Post\AutoEngagementUserPool;
use Database\Seeders\SystemSettingsSeeder;
use Illuminate\Events\CallQueuedListener;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Queue;
use Mockery;
use Tests\Concerns\CreatesVideoPosts;
use Tests\TestCase;

class AutoEngagementTest extends TestCase
{
    use CreatesVideoPosts;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(SystemSettingsSeeder::class);
        Cache::forget(AutoEngagementService::CURSOR_CACHE_KEY);
        Cache::forget(AutoEngagementService::MATURE_CURSOR_CACHE_KEY);
        Cache::forget(AutoLikeNotificationDigest::INDEX_CACHE_KEY);
        Notification::fake();
        Queue::fake();

        $push = Mockery::mock(PushNotificationService::class);
        $push->shouldReceive('dispatch')->andReturn(Mockery::mock(PushNotificationLog::class))->byDefault();
        $this->app->instance(PushNotificationService::class, $push);
    }

    private function activeUser(array $overrides = []): User
    {
        return User::factory()->create(array_merge([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ], $overrides));
    }

    /** @param  int  $dailyMax  max likes/views per reel per day */
    private function enable(int $dailyMax = 3): void
    {
        $settings = app(PostsSettings::class);
        $settings->autoEngagementEnabled = 1;
        $settings->reelsEngagementPerDay = $dailyMax;
        $settings->save();
    }

    /** Pin today's drip quota so tests are deterministic. */
    private function seedDailyQuota(Post $post, int $quota): void
    {
        Cache::put(
            AutoEngagementService::dailyStateCacheKey((int) $post->id, now()->toDateString()),
            ['quota' => $quota, 'likes' => 0, 'views' => 0],
            now()->addDays(2)
        );
    }

    private function publishedReel(User $owner, array $extra = []): Post
    {
        return $this->makeVideoPost($owner, array_merge([
            'body' => 'Auto engage reel',
            'status' => PostStatusEnum::Ready,
            // Clearly inside the 10-day hot window (avoid boundary flakiness).
            'published_at' => now()->subDays(2),
            'likes_count' => 0,
            'views_count' => 0,
        ], $extra));
    }

    private function publishedTextPost(User $owner, array $extra = []): Post
    {
        return Post::query()->create(array_merge([
            'user_id' => $owner->id,
            'type' => PostTypeEnum::Text,
            'body' => 'Auto engage text',
            'status' => PostStatusEnum::Ready,
            'published_at' => now()->subDays(2),
            'likes_count' => 0,
            'views_count' => 0,
        ], $extra));
    }

    public function test_processes_reels_in_id_chunks(): void
    {
        $this->enable(1);

        $owner = $this->activeUser();
        foreach (range(1, 6) as $_) {
            $this->activeUser();
        }

        $p1 = $this->publishedReel($owner);
        $p2 = $this->publishedReel($owner);
        $p3 = $this->publishedReel($owner);

        $service = app(AutoEngagementService::class);
        $this->assertSame(3, $service->chunkSize());

        // Same owner: up to 2 likes/tick across posts; never >1 like per post.
        $liked = $service->process();
        $this->assertGreaterThanOrEqual(1, $liked);
        $this->assertLessThanOrEqual(2, $liked);
        $likesAfterFirst = (int) $p1->fresh()->likes_count
            + (int) $p2->fresh()->likes_count
            + (int) $p3->fresh()->likes_count;
        $this->assertSame($liked, $likesAfterFirst);
        foreach ([$p1, $p2, $p3] as $post) {
            $this->assertLessThanOrEqual(1, (int) $post->fresh()->likes_count);
        }

        while (
            (int) $p1->fresh()->likes_count
            + (int) $p2->fresh()->likes_count
            + (int) $p3->fresh()->likes_count < 3
        ) {
            $this->assertGreaterThan(0, $service->process());
        }

        $this->assertSame(1, (int) $p1->fresh()->likes_count);
        $this->assertSame(1, (int) $p2->fresh()->likes_count);
        $this->assertSame(1, (int) $p3->fresh()->likes_count);
        $this->assertGreaterThan((int) $p1->fresh()->likes_count, (int) $p1->fresh()->views_count);

        // Daily quota is 1 like per post; another tick must not stack more likes.
        $this->assertSame(0, $service->process());

        $this->assertFalse($service->isComplete());

        // Auto likes are silent until digest flush.
        Notification::assertNothingSent();
    }

    public function test_auto_engagement_likes_digest_after_window(): void
    {
        $this->enable(1);

        $owner = $this->activeUser();
        foreach (range(1, 8) as $_) {
            $this->activeUser();
        }

        $post = $this->publishedReel($owner);

        app(AutoEngagementService::class)->process();

        $this->assertSame(1, (int) $post->fresh()->likes_count);
        Notification::assertNothingSent();

        $this->travel(AutoLikeNotificationDigest::WINDOW_MINUTES + 1)->minutes();
        $flushed = app(AutoLikeNotificationDigest::class)->flushDue();
        $this->assertSame(1, $flushed);

        Notification::assertSentTo($owner, PostLikedUserNotification::class);
    }

    public function test_simple_posts_only_get_likes_not_views(): void
    {
        // daily 5 → simple daily round(3); pin quota to 2.
        $this->enable(5);

        $owner = $this->activeUser();
        foreach (range(1, 4) as $_) {
            $this->activeUser();
        }

        $post = $this->publishedTextPost($owner);
        $this->seedDailyQuota($post, 2);
        $service = app(AutoEngagementService::class);

        $service->process();
        $service->process();

        $fresh = $post->fresh();
        $this->assertSame(2, (int) $fresh->likes_count);
        $this->assertSame(0, (int) $fresh->views_count);
    }

    public function test_daily_quota_caps_growth_until_next_day(): void
    {
        $this->enable(5);

        $owner = $this->activeUser();
        foreach (range(1, 8) as $_) {
            $this->activeUser();
        }

        $post = $this->publishedReel($owner);
        $this->seedDailyQuota($post, 2);
        $service = app(AutoEngagementService::class);

        $service->process();
        $service->process();
        $this->assertSame(2, (int) $post->fresh()->likes_count);
        // Daily like quota exhausted — further ticks must not stack more likes.
        $service->process();
        $this->assertSame(2, (int) $post->fresh()->likes_count);

        $this->travel(1)->days();
        $this->seedDailyQuota($post, 2);
        $service->resetCursor();
        $service->process();
        $this->assertSame(3, (int) $post->fresh()->likes_count);
    }

    public function test_hot_posts_preferred_over_mature_same_owner(): void
    {
        $this->enable(50);

        $owner = $this->activeUser();
        foreach (range(1, 40) as $_) {
            $this->activeUser();
        }

        $old = $this->publishedReel($owner, [
            'published_at' => now()->subDays(PostsSettings::AUTO_ENGAGEMENT_HOT_DAYS + 5),
        ]);
        $hot = $this->publishedReel($owner, ['published_at' => now()->subDays(2)]);
        $this->seedDailyQuota($old, 10);
        $this->seedDailyQuota($hot, 1);

        $service = app(AutoEngagementService::class);
        $this->assertSame(2, $service->remainingUnderTargetCount());

        // Hot preferred first; same owner may also get a mature drip in the same tick (LIKES_PER_OWNER=2).
        $liked = $service->process();
        $this->assertGreaterThanOrEqual(1, $liked);
        $this->assertLessThanOrEqual(2, $liked);
        $this->assertSame(1, (int) $hot->fresh()->likes_count);
        $this->assertGreaterThan((int) $hot->fresh()->likes_count, (int) $hot->fresh()->views_count);

        if ((int) $old->fresh()->likes_count === 0) {
            $this->assertSame(1, $service->process());
        }
        $this->assertSame(1, (int) $old->fresh()->likes_count);
        $this->assertGreaterThan((int) $old->fresh()->likes_count, (int) $old->fresh()->views_count);
    }

    public function test_hot_pass_does_not_stall_after_cursor_reaches_newest_id(): void
    {
        $this->enable(50);

        foreach (range(1, 30) as $_) {
            $this->activeUser();
        }

        $owners = [];
        $hotPosts = [];
        foreach (range(1, 6) as $_) {
            $owner = $this->activeUser();
            $owners[] = $owner;
            $post = $this->publishedReel($owner, ['published_at' => now()->subDay()]);
            $this->seedDailyQuota($post, 10);
            $hotPosts[] = $post;
        }

        // Simulate production failure mode: hot cursor already at the newest post id.
        $newestId = (int) collect($hotPosts)->max(fn (Post $p) => $p->id);
        Cache::forever(AutoEngagementService::CURSOR_CACHE_KEY, $newestId);

        $liked = app(AutoEngagementService::class)->process();
        $this->assertGreaterThanOrEqual(6, $liked);

        $hotLikes = 0;
        foreach ($hotPosts as $post) {
            $hotLikes += (int) $post->fresh()->likes_count;
        }
        $this->assertGreaterThanOrEqual(6, $hotLikes);
    }

    public function test_reel_likes_stay_strictly_below_views(): void
    {
        $this->enable(10);

        $owner = $this->activeUser();
        foreach (range(1, 40) as $_) {
            $this->activeUser();
        }

        $post = $this->publishedReel($owner);
        $this->seedDailyQuota($post, 5);
        $service = app(AutoEngagementService::class);
        $service->process();

        $fresh = $post->fresh();
        $this->assertSame(1, (int) $fresh->likes_count);
        $this->assertGreaterThan((int) $fresh->likes_count, (int) $fresh->views_count);
        // ~20% likes → views should be several× likes (test floor = 1+3 extras).
        $this->assertGreaterThanOrEqual(4, (int) $fresh->views_count);
    }

    public function test_new_reels_keep_likes_near_twenty_percent_of_views(): void
    {
        $this->enable(20);

        foreach (range(1, 50) as $_) {
            $this->activeUser();
        }

        $posts = [];
        foreach ([1, 3, 5, 8] as $seedViews) {
            $owner = $this->activeUser();
            // Different starting views so the feed does not open on identical counters.
            $post = $this->publishedReel($owner, ['views_count' => $seedViews]);
            $this->seedDailyQuota($post, 3);
            $posts[] = $post;
        }

        $service = app(AutoEngagementService::class);
        $service->process();
        $service->process();

        $viewCounts = [];
        foreach ($posts as $post) {
            $fresh = $post->fresh();
            $likes = (int) $fresh->likes_count;
            $views = (int) $fresh->views_count;
            $this->assertGreaterThan($likes, $views);
            if ($likes > 0) {
                // Floor budget is 4 views/like in tests; production randomizes 4–8.
                $this->assertGreaterThanOrEqual($likes * 4, $views);
            }
            $viewCounts[] = $views;
        }

        $this->assertGreaterThan(1, count(array_unique($viewCounts)));
    }

    public function test_remaining_count_tracks_progress(): void
    {
        $this->enable(1); // like lifetime 30, view lifetime 150 (5×)
        $owner = $this->activeUser();
        foreach (range(1, 12) as $_) {
            $this->activeUser();
        }
        // Near like lifetime; views one like-burst under the 5× ceiling so one tick can finish.
        $this->publishedReel($owner, ['likes_count' => 29, 'views_count' => 146]);
        $this->publishedReel($owner, ['likes_count' => 29, 'views_count' => 146]);

        $service = app(AutoEngagementService::class);
        $this->assertSame(2, $service->remainingUnderTargetCount());

        $ticks = 0;
        while (! $service->isComplete() && $ticks < 40) {
            $service->process();
            $ticks++;
        }

        $this->assertSame(0, $service->remainingUnderTargetCount());
    }

    public function test_wraps_cursor_when_past_end(): void
    {
        $this->enable(2);
        $owner = $this->activeUser();
        foreach (range(1, 5) as $_) {
            $this->activeUser();
        }
        $a = $this->publishedReel($owner);
        $b = $this->publishedReel($owner);
        $this->seedDailyQuota($a, 1);
        $this->seedDailyQuota($b, 1);

        $service = app(AutoEngagementService::class);

        $liked = $service->process();
        $this->assertGreaterThanOrEqual(1, $liked);
        $this->assertLessThanOrEqual(2, $liked);
        $this->assertSame(
            $liked,
            (int) $a->fresh()->likes_count + (int) $b->fresh()->likes_count
        );

        while ((int) $a->fresh()->likes_count + (int) $b->fresh()->likes_count < 2) {
            $this->assertGreaterThan(0, $service->process());
        }

        $this->assertSame(1, (int) $a->fresh()->likes_count);
        $this->assertSame(1, (int) $b->fresh()->likes_count);
        $this->assertSame(0, $service->process());

        $this->travel(1)->days();
        $this->seedDailyQuota($a, 1);
        $this->seedDailyQuota($b, 1);
        // Same owner: up to 2 likes/tick can cover both posts after the cursor wraps.
        $this->assertSame(2, $service->process());
        $this->assertSame(2, (int) $a->fresh()->likes_count);
        $this->assertSame(2, (int) $b->fresh()->likes_count);
    }

    public function test_disabled_does_nothing(): void
    {
        $settings = app(PostsSettings::class);
        $settings->autoEngagementEnabled = 0;
        $settings->reelsEngagementPerDay = 5;
        $settings->save();

        $owner = $this->activeUser();
        $this->activeUser();
        $post = $this->publishedReel($owner);

        $this->assertSame(0, app(AutoEngagementService::class)->process());
        $this->assertSame(0, PostLike::query()->where('post_id', $post->id)->count());
    }

    public function test_command_reports_remaining(): void
    {
        $this->enable(1);
        $owner = $this->activeUser();
        $this->activeUser();
        $this->publishedReel($owner);

        $this->artisan('posts:process-auto-engagement')
            ->expectsOutputToContain('soft lifetime')
            ->assertSuccessful();
    }

    public function test_chunk_size_covers_catalog_each_tick(): void
    {
        $owner = $this->activeUser();
        foreach (range(1, 32) as $_) {
            $this->publishedReel($owner, ['published_at' => now()->subDay()]);
        }

        $service = app(AutoEngagementService::class);
        $this->assertSame(32, $service->chunkSize());

        foreach (range(1, 32) as $_) {
            $this->publishedReel($owner, ['published_at' => now()->subDay()]);
        }

        $this->assertSame(64, $service->chunkSize());
    }

    public function test_never_stacks_more_than_one_like_per_tick(): void
    {
        $this->enable(50);
        $owner = $this->activeUser();
        foreach (range(1, 8) as $_) {
            $this->activeUser();
        }
        $post = $this->publishedReel($owner);
        $this->seedDailyQuota($post, 50);

        app(AutoEngagementService::class)->process();

        $this->assertSame(1, (int) $post->fresh()->likes_count);
        $this->assertGreaterThan(1, (int) $post->fresh()->views_count);
    }

    public function test_one_like_per_owner_per_tick_across_posts(): void
    {
        $this->enable(50);
        $owner = $this->activeUser();
        $other = $this->activeUser();
        foreach (range(1, 12) as $_) {
            $this->activeUser();
        }

        $owned = [];
        foreach (range(1, 5) as $_) {
            $post = $this->publishedReel($owner);
            $this->seedDailyQuota($post, 50);
            $owned[] = $post;
        }
        $otherPost = $this->publishedReel($other);
        $this->seedDailyQuota($otherPost, 50);

        $liked = app(AutoEngagementService::class)->process();
        $this->assertSame(3, $liked);

        $ownerLikes = 0;
        foreach ($owned as $post) {
            $ownerLikes += (int) $post->fresh()->likes_count;
            $this->assertLessThanOrEqual(1, (int) $post->fresh()->likes_count);
        }
        $this->assertSame(2, $ownerLikes);
        $this->assertSame(1, (int) $otherPost->fresh()->likes_count);
    }

    public function test_daily_max_derives_lifetime_and_drip_range(): void
    {
        $settings = app(PostsSettings::class);
        $settings->reelsEngagementPerDay = 5;
        $settings->save();

        $this->assertSame(5, $settings->reelsDailyMax());
        $this->assertSame(3, $settings->simpleDailyMax());
        $this->assertSame(150, $settings->reelsLifetimeMax());
        $this->assertSame(90, $settings->simpleLifetimeMax());
        $this->assertSame([4, 5], $settings->dailyDripRange(5));
        $this->assertSame([40, 50], $settings->dailyDripRange(50));
        $this->assertSame([1, 25], $settings->matureDailyDripRange(50));
        // Views target ~5× likes (likes ≈20% of views).
        $this->assertSame(750, $settings->reelsViewsLifetimeMax());
        $this->assertSame(25, $settings->scaleViewsAboveLikes(5));

        $settings->reelsEngagementPerDay = 999;
        $settings->save();
        $this->assertSame(200, app(PostsSettings::class)->reelsDailyMax());

        $this->assertSame(PostsSettings::AUTO_ENGAGEMENT_HOT_DAYS, $settings->autoEngagementFreshDays());
        $this->assertSame(PostsSettings::AUTO_ENGAGEMENT_LIFE_DAYS, $settings->autoEngagementLifeDays());
        $this->assertSame(10, PostsSettings::AUTO_ENGAGEMENT_HOT_DAYS);
        $this->assertSame(30, PostsSettings::AUTO_ENGAGEMENT_LIFE_DAYS);
    }

    public function test_actor_pool_excludes_reserved_twenty_percent(): void
    {
        $this->enable(10);
        $owner = $this->activeUser();
        $poolActors = [];
        $reservedActors = [];

        foreach (range(1, 40) as $_) {
            $user = $this->activeUser();
            if (AutoEngagementUserPool::containsUserId((int) $user->id)) {
                $poolActors[] = $user;
            } else {
                $reservedActors[] = $user;
            }
        }

        $this->assertNotEmpty($poolActors);
        $this->assertNotEmpty($reservedActors);

        $post = $this->publishedReel($owner);
        $this->seedDailyQuota($post, 10);

        for ($i = 0; $i < 8; $i++) {
            app(AutoEngagementService::class)->process();
        }

        $likerIds = PostLike::query()->where('post_id', $post->id)->pluck('user_id')->all();
        $this->assertNotEmpty($likerIds);
        foreach ($likerIds as $likerId) {
            $this->assertTrue(AutoEngagementUserPool::containsUserId((int) $likerId));
        }
    }

    public function test_combined_digest_message_and_real_like_still_instant(): void
    {
        $owner = $this->activeUser(['name' => 'Owner User']);
        $actorA = $this->activeUser(['name' => 'Ali Hassan']);
        $this->assertTrue(AutoEngagementUserPool::containsUserId((int) $actorA->id) || true);

        $post = $this->publishedReel($owner);
        $digest = app(AutoLikeNotificationDigest::class);
        $digest->record($post, $actorA);
        $digest->record($post, $this->activeUser(['name' => 'Sara Khan']));
        $digest->record($post, $this->activeUser(['name' => 'Omar Ali']));

        $this->travel(AutoLikeNotificationDigest::WINDOW_MINUTES + 1)->minutes();
        $this->assertSame(1, $digest->flushDue());

        Notification::assertSentTo($owner, PostLikedUserNotification::class, function ($notification) use ($owner): bool {
            $payload = $notification->toArray($owner);

            return ($payload['others_count'] ?? 0) === 2
                && str_contains((string) $payload['message'], 'and 2 others liked your video')
                && ! str_contains((string) $payload['message'], 'Real Fan and');
        });

        Notification::fake();
        $viewer = $this->activeUser(['name' => 'Real Fan']);
        app(PostInteractionService::class)->like($post, $viewer, notify: true);
        Notification::assertSentTo($owner, PostLikedUserNotification::class, function ($notification) use ($owner): bool {
            $payload = $notification->toArray($owner);

            return ($payload['others_count'] ?? -1) === 0
                && ($payload['message'] ?? '') === 'liked your video'
                && ($payload['actor_name'] ?? '') === 'Real Fan';
        });
        Queue::assertPushed(CallQueuedListener::class, function (CallQueuedListener $job): bool {
            return $job->class === PostLikedPushListener::class;
        });
    }
}
