<?php

namespace Tests\Feature\Post;

use App\Enums\Post\PostStatusEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Listeners\PostCommentedPushListener;
use App\Models\Post;
use App\Models\PostComment;
use App\Models\PostCommentMention;
use App\Models\User;
use App\Notifications\PostCommentedUserNotification;
use App\Services\Post\AutoCommentService;
use App\Services\Post\PostCommentService;
use App\Settings\PostsSettings;
use App\Support\Post\AutoCommentPhrases;
use Database\Seeders\SystemSettingsSeeder;
use Illuminate\Events\CallQueuedListener;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Queue;
use Tests\Concerns\CreatesVideoPosts;
use Tests\TestCase;

class AutoCommentTest extends TestCase
{
    use CreatesVideoPosts;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(SystemSettingsSeeder::class);
        Cache::forget(AutoCommentService::CURSOR_CACHE_KEY);
        Notification::fake();
        Queue::fake();
    }

    private function activeUser(array $overrides = []): User
    {
        return User::factory()->create(array_merge([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ], $overrides));
    }

    private function dormantUser(): User
    {
        return $this->activeUser(['last_active_at' => null]);
    }

    private function recentUser(): User
    {
        return $this->activeUser(['last_active_at' => now()->subDays(2)]);
    }

    private function enable(int $dailyLikes = 50): void
    {
        $settings = app(PostsSettings::class);
        $settings->autoEngagementEnabled = 1;
        $settings->reelsEngagementPerDay = $dailyLikes;
        $settings->save();
    }

    private function publishedReel(User $owner, array $extra = []): Post
    {
        return $this->makeVideoPost($owner, array_merge([
            'body' => 'Auto comment reel',
            'status' => PostStatusEnum::Ready,
            'published_at' => now()->subDays(2),
            'likes_count' => 25,
            'views_count' => 40,
            'comments_count' => 0,
        ], $extra));
    }

    public function test_comments_from_dormant_accounts_only(): void
    {
        $this->enable();

        $owner = $this->recentUser();
        $dormant = $this->dormantUser();
        $this->recentUser();
        $post = $this->publishedReel($owner);
        Cache::put(
            AutoCommentService::dailyStateCacheKey((int) $post->id, now()->toDateString()),
            ['quota' => 2, 'comments' => 0],
            now()->addDays(2)
        );

        $this->assertSame(1, app(AutoCommentService::class)->process());

        $comment = PostComment::query()->where('post_id', $post->id)->first();
        $this->assertNotNull($comment);
        $this->assertSame($dormant->id, (int) $comment->user_id);
        $this->assertNull($comment->parent_id);
        $this->assertStringNotContainsString('@', $comment->body);
        $this->assertSame(1, (int) $post->fresh()->comments_count);
        $this->assertNull($dormant->fresh()->last_active_at);
        $this->assertSame(0, PostCommentMention::query()->where('comment_id', $comment->id)->count());
        Notification::assertSentTo($owner, PostCommentedUserNotification::class);
        Queue::assertPushed(CallQueuedListener::class, function (CallQueuedListener $job): bool {
            return $job->class === PostCommentedPushListener::class;
        });
    }

    public function test_recently_active_users_are_not_used(): void
    {
        $this->enable();
        $owner = $this->recentUser();
        $this->recentUser();
        $post = $this->publishedReel($owner);

        $this->assertSame(0, app(AutoCommentService::class)->process());
        $this->assertSame(0, PostComment::query()->where('post_id', $post->id)->count());
    }

    public function test_does_not_comment_when_likes_are_zero(): void
    {
        $this->enable();
        $owner = $this->recentUser();
        $this->dormantUser();
        $post = $this->publishedReel($owner, ['likes_count' => 0, 'views_count' => 10]);

        $this->assertSame(0, app(AutoCommentService::class)->process());
        $this->assertSame(0, (int) $post->fresh()->comments_count);
    }

    public function test_comments_stay_below_like_ratio_cap(): void
    {
        $this->enable();
        $owner = $this->recentUser();
        foreach (range(1, 5) as $_) {
            $this->dormantUser();
        }

        // 12 likes → floor(12 * 0.08) = 0 room
        $blocked = $this->publishedReel($owner, ['likes_count' => 12, 'views_count' => 20]);
        $this->assertFalse(app(AutoCommentService::class)->commentOnPost($blocked));

        // 25 likes → floor(2.0) = 2
        $open = $this->publishedReel($owner, ['likes_count' => 25, 'views_count' => 40]);
        $this->assertTrue(app(AutoCommentService::class)->commentOnPost($open));
        $this->assertTrue(app(AutoCommentService::class)->commentOnPost($open->fresh()));
        $this->assertFalse(app(AutoCommentService::class)->commentOnPost($open->fresh()));
        $this->assertSame(2, (int) $open->fresh()->comments_count);
        $this->assertLessThan((int) $open->fresh()->likes_count, (int) $open->fresh()->comments_count);
        $this->assertLessThan((int) $open->fresh()->views_count, (int) $open->fresh()->comments_count);
    }

    public function test_same_comment_text_is_not_repeated_on_a_post(): void
    {
        $this->enable();
        $owner = $this->recentUser();
        foreach (range(1, 4) as $_) {
            $this->dormantUser();
        }
        $post = $this->publishedReel($owner, ['likes_count' => 50, 'views_count' => 80]);

        app(PostCommentService::class)->create($post, $this->dormantUser(), 'Keep it up bhai', notify: false);

        $this->assertTrue(app(AutoCommentService::class)->commentOnPost($post->fresh()));
        $this->assertTrue(app(AutoCommentService::class)->commentOnPost($post->fresh()));

        $normalized = PostComment::query()
            ->where('post_id', $post->id)
            ->pluck('body')
            ->map(fn (string $body): string => AutoCommentPhrases::normalize($body));

        $this->assertSame($normalized->count(), $normalized->unique()->count());
        $this->assertTrue($normalized->contains(AutoCommentPhrases::normalize('Keep it up bhai')));
    }

    public function test_same_user_does_not_comment_twice_on_one_post(): void
    {
        $this->enable();
        $owner = $this->recentUser();
        $this->dormantUser();
        $post = $this->publishedReel($owner, ['likes_count' => 50, 'views_count' => 80]);

        $this->assertTrue(app(AutoCommentService::class)->commentOnPost($post));
        $this->assertFalse(app(AutoCommentService::class)->commentOnPost($post->fresh()));
        $this->assertSame(1, PostComment::query()->where('post_id', $post->id)->count());
    }

    public function test_daily_quota_caps_until_next_day(): void
    {
        $this->enable();
        $owner = $this->recentUser();
        foreach (range(1, 4) as $_) {
            $this->dormantUser();
        }
        $post = $this->publishedReel($owner, ['likes_count' => 50, 'views_count' => 80]);
        Cache::put(
            AutoCommentService::dailyStateCacheKey((int) $post->id, now()->toDateString()),
            ['quota' => 1, 'comments' => 0],
            now()->addDays(2)
        );

        $service = app(AutoCommentService::class);
        $this->assertSame(1, $service->process());
        $this->assertSame(0, $service->process());
        $this->assertSame(1, (int) $post->fresh()->comments_count);

        $this->travel(1)->days();
        Cache::put(
            AutoCommentService::dailyStateCacheKey((int) $post->id, now()->toDateString()),
            ['quota' => 1, 'comments' => 0],
            now()->addDays(2)
        );
        $service->resetCursor();
        $this->assertSame(1, $service->process());
        $this->assertSame(2, (int) $post->fresh()->comments_count);
    }

    public function test_disabled_does_nothing(): void
    {
        $settings = app(PostsSettings::class);
        $settings->autoEngagementEnabled = 0;
        $settings->reelsEngagementPerDay = 50;
        $settings->save();

        $owner = $this->recentUser();
        $this->dormantUser();
        $post = $this->publishedReel($owner);

        $this->assertSame(0, app(AutoCommentService::class)->process());
        $this->assertSame(0, PostComment::query()->where('post_id', $post->id)->count());
    }

    public function test_command_runs(): void
    {
        $this->enable();
        $owner = $this->recentUser();
        $this->dormantUser();
        $this->publishedReel($owner);

        $this->artisan('posts:process-auto-comments')
            ->expectsOutputToContain('Commented on')
            ->assertSuccessful();
    }

    public function test_phrases_are_combinatorial_and_never_mention(): void
    {
        $seen = [];
        foreach (range(1, 120) as $_) {
            $body = AutoCommentPhrases::random();
            $this->assertNotSame('', trim($body));
            $this->assertLessThanOrEqual(500, mb_strlen($body));
            $this->assertStringNotContainsString('@', $body);
            $this->assertDoesNotMatchRegularExpression(
                '/\b(batting|bowling|shot|knock|hitting)\b/i',
                $body
            );
            $seen[$body] = true;
        }

        $this->assertGreaterThan(25, count($seen));

        $unused = AutoCommentPhrases::randomUnused(['Keep it up bhai', 'keep it up bhai!']);
        $this->assertNotNull($unused);
        $this->assertNotSame(
            AutoCommentPhrases::normalize('Keep it up bhai'),
            AutoCommentPhrases::normalize($unused)
        );
    }

    public function test_comment_caps_derive_from_like_daily_max(): void
    {
        $settings = app(PostsSettings::class);
        $settings->reelsEngagementPerDay = 50;
        $settings->save();

        $this->assertSame(2, $settings->reelsCommentDailyMax());
        $this->assertSame(1, $settings->simpleCommentDailyMax());
        $this->assertSame(60, $settings->reelsCommentLifetimeMax());
        $this->assertSame(2, $settings->commentCapFromLikes(25));
        $this->assertSame(0, $settings->commentCapFromLikes(0));
    }
}
