<?php

namespace Tests\Feature\Post;

use App\Enums\Post\PostStatusEnum;
use App\Enums\Post\PostTypeEnum;
use App\Enums\Post\PostVisibilityEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\Post;
use App\Models\PostLike;
use App\Models\PushNotificationLog;
use App\Models\User;
use App\Notifications\PostLikedUserNotification;
use App\Services\Post\AutoEngagementService;
use App\Services\Push\PushNotificationService;
use App\Settings\PostsSettings;
use Database\Seeders\SystemSettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Notification;
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
            'visibility' => 'public',
            'published_at' => now()->subDays(10),
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
            'visibility' => PostVisibilityEnum::Public,
            'published_at' => now()->subDays(10),
            'likes_count' => 0,
            'views_count' => 0,
        ], $extra));
    }

    public function test_processes_reels_in_id_chunks(): void
    {
        Notification::fake();
        $this->enable(1);

        $owner = $this->activeUser();
        foreach (range(1, 6) as $_) {
            $this->activeUser();
        }

        $p1 = $this->publishedReel($owner);
        $p2 = $this->publishedReel($owner);
        $p3 = $this->publishedReel($owner);

        $service = app(AutoEngagementService::class);
        $this->assertSame(1, $service->chunkSize());

        $first = $service->process();
        $this->assertSame(1, $first);
        $this->assertSame(1, (int) $p1->fresh()->likes_count);
        $this->assertSame(0, (int) $p2->fresh()->likes_count);
        $this->assertSame(0, (int) $p3->fresh()->likes_count);

        $second = $service->process();
        $this->assertSame(1, $second);
        $this->assertSame(1, (int) $p2->fresh()->likes_count);

        $third = $service->process();
        $this->assertSame(1, $third);
        $this->assertSame(1, (int) $p3->fresh()->likes_count);

        // Soft lifetime still leaves room; today's drip is exhausted for all three.
        $this->assertFalse($service->isComplete());
        $this->assertSame(0, $service->process());

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
        $service->process();

        $this->assertSame(2, (int) $post->fresh()->likes_count);

        $this->travel(1)->days();
        $this->seedDailyQuota($post, 2);
        $service->resetCursor();
        $service->process();
        $service->process();

        $this->assertSame(4, (int) $post->fresh()->likes_count);
    }

    public function test_freshness_window_skips_old_posts(): void
    {
        $this->enable(5);

        $owner = $this->activeUser();
        $this->activeUser();
        $old = $this->publishedReel($owner, [
            'published_at' => now()->subDays(PostsSettings::AUTO_ENGAGEMENT_FRESH_DAYS + 5),
        ]);
        $fresh = $this->publishedReel($owner, ['published_at' => now()->subDays(2)]);
        $this->seedDailyQuota($fresh, 1);

        $service = app(AutoEngagementService::class);
        $this->assertSame(1, $service->remainingUnderTargetCount());

        $service->process();

        $this->assertSame(0, (int) $old->fresh()->likes_count);
        $this->assertSame(1, (int) $fresh->fresh()->likes_count);
    }

    public function test_remaining_count_tracks_progress(): void
    {
        $this->enable(1); // soft lifetime = 30
        $owner = $this->activeUser();
        $this->activeUser();
        $this->publishedReel($owner, ['likes_count' => 29, 'views_count' => 29]);
        $this->publishedReel($owner, ['likes_count' => 29, 'views_count' => 29]);

        $service = app(AutoEngagementService::class);
        $this->assertSame(2, $service->remainingUnderTargetCount());

        while (! $service->isComplete()) {
            $service->process();
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

        $service->process();
        $this->assertSame((int) $a->id, $service->cursor());
        $this->assertSame(1, (int) $a->fresh()->likes_count);

        $service->process();
        $this->assertSame((int) $b->id, $service->cursor());
        $this->assertSame(1, (int) $b->fresh()->likes_count);

        $service->process();
        $this->assertSame(1, (int) $a->fresh()->likes_count);
        $this->assertSame(1, (int) $b->fresh()->likes_count);

        $this->travel(1)->days();
        $this->seedDailyQuota($a, 1);
        $service->process();
        $this->assertSame(2, (int) $a->fresh()->likes_count);
        $this->assertSame(1, (int) $b->fresh()->likes_count);
        $this->assertSame((int) $a->id, $service->cursor());
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

    public function test_chunk_size_scales_with_ready_catalog(): void
    {
        $owner = $this->activeUser();
        foreach (range(1, 96) as $_) {
            $this->publishedReel($owner, ['published_at' => now()->subDay()]);
        }

        $service = app(AutoEngagementService::class);
        $this->assertSame(1, $service->chunkSize());

        foreach (range(1, 96) as $_) {
            $this->publishedReel($owner, ['published_at' => now()->subDay()]);
        }

        $this->assertSame(2, $service->chunkSize());
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
        $this->assertSame([1, 5], $settings->dailyDripRange(5));
        $this->assertSame(PostsSettings::AUTO_ENGAGEMENT_FRESH_DAYS, $settings->autoEngagementFreshDays());
    }
}
