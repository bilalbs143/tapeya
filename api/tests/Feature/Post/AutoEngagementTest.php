<?php

namespace Tests\Feature\Post;

use App\Enums\Post\PostStatusEnum;
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

    private function enable(int $likes = 3, int $views = 3, int $chunk = 2, int $drip = 1): void
    {
        $settings = app(PostsSettings::class);
        $settings->autoEngagementEnabled = 1;
        $settings->autoLikeCount = $likes;
        $settings->autoViewCount = $views;
        $settings->autoEngagementPostsPerRun = $chunk;
        $settings->autoEngagementActionsPerPost = $drip;
        $settings->save();
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

    public function test_processes_posts_in_id_chunks(): void
    {
        Notification::fake();
        $this->enable(likes: 1, views: 0, chunk: 2, drip: 1);

        $owner = $this->activeUser();
        foreach (range(1, 6) as $_) {
            $this->activeUser();
        }

        $p1 = $this->publishedReel($owner);
        $p2 = $this->publishedReel($owner);
        $p3 = $this->publishedReel($owner);

        $service = app(AutoEngagementService::class);

        $first = $service->process();
        $this->assertSame(2, $first);
        $this->assertSame(1, (int) $p1->fresh()->likes_count);
        $this->assertSame(1, (int) $p2->fresh()->likes_count);
        $this->assertSame(0, (int) $p3->fresh()->likes_count);

        $second = $service->process();
        $this->assertSame(1, $second);
        $this->assertSame(1, (int) $p3->fresh()->likes_count);

        $this->assertTrue($service->isComplete());
        $this->assertSame(0, $service->process());

        Notification::assertSentTo($owner, PostLikedUserNotification::class);
    }

    public function test_remaining_count_tracks_progress(): void
    {
        $this->enable(likes: 1, views: 0, chunk: 100, drip: 1);
        $owner = $this->activeUser();
        $this->activeUser();
        $this->publishedReel($owner);
        $this->publishedReel($owner);

        $service = app(AutoEngagementService::class);
        $this->assertSame(2, $service->remainingUnderTargetCount());

        $service->process();
        $this->assertSame(0, $service->remainingUnderTargetCount());
    }

    public function test_wraps_cursor_when_past_end(): void
    {
        $this->enable(likes: 2, views: 0, chunk: 1, drip: 1);
        $owner = $this->activeUser();
        foreach (range(1, 5) as $_) {
            $this->activeUser();
        }
        $a = $this->publishedReel($owner);
        $b = $this->publishedReel($owner);

        $service = app(AutoEngagementService::class);
        $service->process(); // a gets 1 like, cursor = a
        $service->process(); // b gets 1 like, cursor = b
        $service->process(); // wrap → a gets 2nd like
        $this->assertSame(2, (int) $a->fresh()->likes_count);
        $this->assertSame(1, (int) $b->fresh()->likes_count);
    }

    public function test_disabled_does_nothing(): void
    {
        $settings = app(PostsSettings::class);
        $settings->autoEngagementEnabled = 0;
        $settings->autoLikeCount = 5;
        $settings->save();

        $owner = $this->activeUser();
        $this->activeUser();
        $post = $this->publishedReel($owner);

        $this->assertSame(0, app(AutoEngagementService::class)->process());
        $this->assertSame(0, PostLike::query()->where('post_id', $post->id)->count());
    }

    public function test_command_reports_remaining(): void
    {
        $this->enable(likes: 1, views: 0, chunk: 10, drip: 1);
        $owner = $this->activeUser();
        $this->activeUser();
        $this->publishedReel($owner);

        $this->artisan('posts:process-auto-engagement')
            ->expectsOutputToContain('All posts at target')
            ->assertSuccessful();
    }
}
