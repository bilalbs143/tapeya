<?php

namespace Tests\Feature\Post;

use App\Enums\Post\PostStatusEnum;
use App\Enums\Push\NotificationEventEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\Post;
use App\Models\PushNotificationLog;
use App\Models\User;
use App\Models\UserFollow;
use App\Notifications\PostCommentedUserNotification;
use App\Notifications\PostCommentLikedUserNotification;
use App\Notifications\PostCommentReplyUserNotification;
use App\Notifications\PostLikedUserNotification;
use App\Notifications\PostMentionedUserNotification;
use App\Notifications\PostPublishedFollowerNotification;
use App\Notifications\PostRepostedUserNotification;
use App\Notifications\UserFollowedUserNotification;
use App\Services\Post\PostService;
use App\Services\Push\PushNotificationService;
use App\Support\Post\PostPaths;
use Database\Seeders\SystemSettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Mockery;
use Tests\Concerns\CreatesVideoPosts;
use Tests\TestCase;

class PostEngagementNotificationTest extends TestCase
{
    use CreatesVideoPosts;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(SystemSettingsSeeder::class);

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

    private function readyTextPost(User $owner): Post
    {
        return Post::query()->create([
            'user_id' => $owner->id,
            'type' => 'text',
            'body' => 'Ready text post',
            'status' => PostStatusEnum::Ready,
            'visibility' => 'public',
            'published_at' => now(),
        ]);
    }

    public function test_like_notifies_reel_owner_with_deep_link(): void
    {
        Notification::fake();

        $owner = $this->activeUser(['name' => 'Owner']);
        $viewer = $this->activeUser(['name' => 'Viewer']);
        $reel = $this->readyReel($owner);

        $this->actingAs($viewer, 'api')
            ->postJson('/api/v1/posts/'.$reel->id.'/like')
            ->assertOk();

        Notification::assertSentTo($owner, PostLikedUserNotification::class, function ($notification) use ($reel, $viewer) {
            $data = $notification->toArray($reel->user);

            return $data['type'] === 'post_liked'
                && $data['post_id'] === $reel->id
                && $data['deep_link'] === PostPaths::deepLink($reel->id)
                && $data['actor_id'] === $viewer->id;
        });

        Notification::assertNotSentTo($viewer, PostLikedUserNotification::class);
    }

    public function test_self_like_does_not_notify(): void
    {
        Notification::fake();

        $owner = $this->activeUser();
        $reel = $this->readyReel($owner);

        $this->actingAs($owner, 'api')
            ->postJson('/api/v1/posts/'.$reel->id.'/like')
            ->assertOk();

        Notification::assertNothingSent();
    }

    public function test_comment_notifies_owner_and_mentions(): void
    {
        Notification::fake();

        $owner = $this->activeUser(['name' => 'Owner', 'nickname' => 'owner_nick']);
        $viewer = $this->activeUser(['name' => 'Viewer', 'nickname' => 'viewer_nick']);
        $mentioned = $this->activeUser(['name' => 'Mentioned', 'nickname' => 'star_player']);
        $reel = $this->readyReel($owner);

        $this->actingAs($viewer, 'api')
            ->postJson('/api/v1/posts/'.$reel->id.'/comments', [
                'body' => 'Nice one @star_player',
            ])
            ->assertCreated();

        Notification::assertSentTo($owner, PostCommentedUserNotification::class, function ($notification) use ($reel) {
            $data = $notification->toArray($reel->user);

            return $data['type'] === 'post_commented'
                && $data['deep_link'] === PostPaths::deepLink($reel->id);
        });

        Notification::assertSentTo($mentioned, PostMentionedUserNotification::class);
        Notification::assertNotSentTo($viewer, PostMentionedUserNotification::class);
    }

    public function test_comment_mention_takes_priority_when_mentioned_user_owns_text_post(): void
    {
        Notification::fake();

        $owner = $this->activeUser(['name' => 'Shoaib Malik', 'nickname' => 'shoaib_malik']);
        $commenter = $this->activeUser(['name' => 'Younas Khan', 'nickname' => 'younas_khan']);
        $post = $this->readyTextPost($owner);

        $this->actingAs($commenter, 'api')
            ->postJson('/api/v1/posts/'.$post->id.'/comments', [
                'body' => 'Great point @shoaib_malik',
            ])
            ->assertCreated();

        Notification::assertSentTo($owner, PostMentionedUserNotification::class, function ($notification) use ($owner, $post) {
            $data = $notification->toArray($owner);

            return $data['type'] === 'post_mentioned'
                && $data['deep_link'] === '/feed/'.$post->id
                && str_contains((string) $data['message'], 'mentioned you in a comment');
        });
        Notification::assertNotSentTo($owner, PostCommentedUserNotification::class);
    }

    public function test_generic_comment_on_text_post_uses_post_wording(): void
    {
        Notification::fake();

        $owner = $this->activeUser(['name' => 'Shoaib Malik']);
        $commenter = $this->activeUser(['name' => 'Younas Khan']);
        $post = $this->readyTextPost($owner);

        $this->actingAs($commenter, 'api')
            ->postJson('/api/v1/posts/'.$post->id.'/comments', [
                'body' => 'Great point',
            ])
            ->assertCreated();

        Notification::assertSentTo($owner, PostCommentedUserNotification::class, function ($notification) use ($owner, $post) {
            $data = $notification->toArray($owner);
            $message = (string) $data['message'];

            return $data['deep_link'] === '/feed/'.$post->id
                && str_contains($message, 'commented on your post')
                && ! str_contains($message, 'commented on your reel');
        });
    }

    public function test_caption_mention_notifies_on_text_compose(): void
    {
        Notification::fake();

        $author = $this->activeUser(['name' => 'Author', 'nickname' => 'author_nick']);
        $mentioned = $this->activeUser(['name' => 'Mentioned', 'nickname' => 'star_player']);

        $this->actingAs($author, 'api')
            ->postJson('/api/v1/posts', [
                'type' => 'text',
                'body' => 'Big shoutout @star_player',
                'visibility' => 'public',
            ])
            ->assertCreated();

        Notification::assertSentTo($mentioned, PostMentionedUserNotification::class, function ($notification) use ($mentioned) {
            $data = $notification->toArray($mentioned);

            return $data['type'] === 'post_mentioned'
                && $data['comment_id'] === null
                && str_contains((string) $data['message'], 'post');
        });

        $this->assertDatabaseHas('post_mentions', [
            'mentioned_user_id' => $mentioned->id,
        ]);
    }

    public function test_caption_mention_skips_self_and_private_unreachable_users(): void
    {
        Notification::fake();

        $author = $this->activeUser(['name' => 'Author', 'nickname' => 'author_nick']);
        $stranger = $this->activeUser(['name' => 'Stranger', 'nickname' => 'stranger_nick']);

        $this->actingAs($author, 'api')
            ->postJson('/api/v1/posts', [
                'type' => 'text',
                'body' => 'Only me @author_nick and @stranger_nick',
                'visibility' => 'private',
            ])
            ->assertCreated();

        Notification::assertNotSentTo($author, PostMentionedUserNotification::class);
        Notification::assertNotSentTo($stranger, PostMentionedUserNotification::class);
    }

    public function test_caption_update_notifies_newly_mentioned_user_once(): void
    {
        Notification::fake();

        $author = $this->activeUser(['nickname' => 'author_nick']);
        $mentioned = $this->activeUser(['nickname' => 'star_player']);

        $create = $this->actingAs($author, 'api')
            ->postJson('/api/v1/posts', [
                'type' => 'text',
                'body' => 'Hello world',
                'visibility' => 'public',
            ])
            ->assertCreated();

        $postId = $create->json('data.id');

        Notification::assertNotSentTo($mentioned, PostMentionedUserNotification::class);

        $this->actingAs($author, 'api')
            ->patchJson('/api/v1/posts/'.$postId, [
                'body' => 'Hello @star_player',
            ])
            ->assertOk();

        Notification::assertSentTo($mentioned, PostMentionedUserNotification::class);

        Notification::fake();

        $this->actingAs($author, 'api')
            ->patchJson('/api/v1/posts/'.$postId, [
                'body' => 'Hello again @star_player',
            ])
            ->assertOk();

        Notification::assertNotSentTo($mentioned, PostMentionedUserNotification::class);
    }

    public function test_mentioning_owner_sends_single_mention_notification(): void
    {
        Notification::fake();

        $owner = $this->activeUser(['name' => 'Owner', 'nickname' => 'owner_nick']);
        $viewer = $this->activeUser(['name' => 'Viewer']);
        $reel = $this->readyReel($owner);

        $this->actingAs($viewer, 'api')
            ->postJson('/api/v1/posts/'.$reel->id.'/comments', [
                'body' => 'Great @owner_nick',
            ])
            ->assertCreated();

        Notification::assertSentToTimes($owner, PostMentionedUserNotification::class, 1);
        Notification::assertNotSentTo($owner, PostCommentedUserNotification::class);
    }

    public function test_email_like_text_does_not_mention_users(): void
    {
        Notification::fake();

        $owner = $this->activeUser(['name' => 'Owner']);
        $viewer = $this->activeUser(['name' => 'Viewer']);
        $gmailNick = $this->activeUser(['name' => 'Gmail', 'nickname' => 'gmail']);
        $reel = $this->readyReel($owner);

        $this->actingAs($viewer, 'api')
            ->postJson('/api/v1/posts/'.$reel->id.'/comments', [
                'body' => 'mail me at user@gmail.com',
            ])
            ->assertCreated();

        Notification::assertSentTo($owner, PostCommentedUserNotification::class);
        Notification::assertNotSentTo($gmailNick, PostMentionedUserNotification::class);
    }

    public function test_reply_notifies_parent_author_not_owner_twice(): void
    {
        Notification::fake();

        $owner = $this->activeUser(['name' => 'Owner']);
        $commenter = $this->activeUser(['name' => 'Commenter']);
        $replier = $this->activeUser(['name' => 'Replier']);
        $reel = $this->readyReel($owner);

        $top = $this->actingAs($commenter, 'api')
            ->postJson('/api/v1/posts/'.$reel->id.'/comments', ['body' => 'First'])
            ->assertCreated()
            ->json('data');

        Notification::assertSentTo($owner, PostCommentedUserNotification::class);
        Notification::fake();

        $this->actingAs($replier, 'api')
            ->postJson('/api/v1/posts/'.$reel->id.'/comments', [
                'body' => 'Second',
                'parent_id' => $top['id'],
            ])
            ->assertCreated();

        Notification::assertSentTo($commenter, PostCommentReplyUserNotification::class);
        Notification::assertNotSentTo($owner, PostCommentedUserNotification::class);
        Notification::assertNotSentTo($owner, PostCommentReplyUserNotification::class);
    }

    public function test_follow_notifies_followed_user(): void
    {
        Notification::fake();

        $follower = $this->activeUser(['name' => 'Follower']);
        $followed = $this->activeUser(['name' => 'Followed']);

        $this->actingAs($follower, 'api')
            ->postJson('/api/v1/users/'.$followed->id.'/follow')
            ->assertOk();

        Notification::assertSentTo($followed, UserFollowedUserNotification::class, function ($notification) use ($follower, $followed) {
            $data = $notification->toArray($followed);

            return $data['type'] === 'user_followed'
                && $data['actor_id'] === $follower->id
                && $data['deep_link'] === '/notification-center';
        });
    }

    public function test_re_follow_does_not_notify_again(): void
    {
        Notification::fake();

        $follower = $this->activeUser();
        $followed = $this->activeUser();

        $this->actingAs($follower, 'api')
            ->postJson('/api/v1/users/'.$followed->id.'/follow')
            ->assertOk();

        Notification::assertSentTo($followed, UserFollowedUserNotification::class);
        Notification::fake();

        $this->actingAs($follower, 'api')
            ->postJson('/api/v1/users/'.$followed->id.'/follow')
            ->assertOk();

        Notification::assertNothingSent();
    }

    public function test_like_dispatches_push_to_owner_with_reel_deep_link(): void
    {
        Notification::fake();

        $owner = $this->activeUser();
        $viewer = $this->activeUser();
        $reel = $this->readyReel($owner);

        $push = Mockery::mock(PushNotificationService::class);
        $push->shouldReceive('dispatch')
            ->once()
            ->withArgs(function (NotificationEventEnum $event, array $data, ?int $userId) use ($reel, $owner, $viewer) {
                return $event === NotificationEventEnum::POST_LIKED
                    && $data['post_id'] === $reel->id
                    && $data['deep_link'] === PostPaths::deepLink($reel->id)
                    && $data['actor_id'] === $viewer->id
                    && $userId === $owner->id;
            })
            ->andReturn(Mockery::mock(PushNotificationLog::class));
        $this->app->instance(PushNotificationService::class, $push);

        $this->actingAs($viewer, 'api')
            ->postJson('/api/v1/posts/'.$reel->id.'/like')
            ->assertOk();
    }

    public function test_comment_like_notifies_comment_author_not_post_owner(): void
    {
        Notification::fake();

        $owner = $this->activeUser(['name' => 'Owner']);
        $commenter = $this->activeUser(['name' => 'Commenter']);
        $liker = $this->activeUser(['name' => 'Liker']);
        $reel = $this->readyReel($owner);

        $comment = $this->actingAs($commenter, 'api')
            ->postJson('/api/v1/posts/'.$reel->id.'/comments', ['body' => 'Like this'])
            ->assertCreated()
            ->json('data');

        Notification::fake();

        $this->actingAs($liker, 'api')
            ->postJson('/api/v1/posts/'.$reel->id.'/comments/'.$comment['id'].'/like')
            ->assertOk();

        Notification::assertSentTo($commenter, PostCommentLikedUserNotification::class, function ($notification) use ($reel, $comment, $liker, $commenter) {
            $data = $notification->toArray($commenter);

            return $data['type'] === 'post_comment_liked'
                && $data['post_id'] === $reel->id
                && $data['comment_id'] === $comment['id']
                && $data['deep_link'] === PostPaths::deepLink($reel->id)
                && $data['actor_id'] === $liker->id;
        });

        Notification::assertNotSentTo($owner, PostCommentLikedUserNotification::class);
        Notification::assertNotSentTo($liker, PostCommentLikedUserNotification::class);
    }

    public function test_self_comment_like_does_not_notify(): void
    {
        Notification::fake();

        $owner = $this->activeUser();
        $commenter = $this->activeUser();
        $reel = $this->readyReel($owner);

        $comment = $this->actingAs($commenter, 'api')
            ->postJson('/api/v1/posts/'.$reel->id.'/comments', ['body' => 'Mine'])
            ->assertCreated()
            ->json('data');

        Notification::fake();

        $this->actingAs($commenter, 'api')
            ->postJson('/api/v1/posts/'.$reel->id.'/comments/'.$comment['id'].'/like')
            ->assertOk();

        Notification::assertNothingSent();
    }

    public function test_comment_re_like_does_not_notify_again(): void
    {
        Notification::fake();

        $owner = $this->activeUser();
        $commenter = $this->activeUser();
        $liker = $this->activeUser();
        $reel = $this->readyReel($owner);

        $comment = $this->actingAs($commenter, 'api')
            ->postJson('/api/v1/posts/'.$reel->id.'/comments', ['body' => 'Once'])
            ->assertCreated()
            ->json('data');

        Notification::fake();

        $this->actingAs($liker, 'api')
            ->postJson('/api/v1/posts/'.$reel->id.'/comments/'.$comment['id'].'/like')
            ->assertOk();

        Notification::assertSentTo($commenter, PostCommentLikedUserNotification::class);
        Notification::fake();

        $this->actingAs($liker, 'api')
            ->postJson('/api/v1/posts/'.$reel->id.'/comments/'.$comment['id'].'/like')
            ->assertOk();

        Notification::assertNothingSent();
    }

    public function test_comment_like_dispatches_push_to_comment_author(): void
    {
        Notification::fake();

        $owner = $this->activeUser();
        $commenter = $this->activeUser();
        $liker = $this->activeUser();
        $reel = $this->readyReel($owner);

        $comment = $this->actingAs($commenter, 'api')
            ->postJson('/api/v1/posts/'.$reel->id.'/comments', ['body' => 'Push me'])
            ->assertCreated()
            ->json('data');

        $push = Mockery::mock(PushNotificationService::class);
        $push->shouldReceive('dispatch')
            ->once()
            ->withArgs(function (NotificationEventEnum $event, array $data, ?int $userId) use ($reel, $comment, $commenter, $liker) {
                return $event === NotificationEventEnum::POST_COMMENT_LIKED
                    && $data['post_id'] === $reel->id
                    && $data['comment_id'] === $comment['id']
                    && $data['deep_link'] === PostPaths::deepLink($reel->id)
                    && $data['actor_id'] === $liker->id
                    && $userId === $commenter->id;
            })
            ->andReturn(Mockery::mock(PushNotificationLog::class));
        $this->app->instance(PushNotificationService::class, $push);

        $this->actingAs($liker, 'api')
            ->postJson('/api/v1/posts/'.$reel->id.'/comments/'.$comment['id'].'/like')
            ->assertOk();
    }

    public function test_follow_dispatches_push_with_notification_center_link(): void
    {
        Notification::fake();

        $follower = $this->activeUser(['name' => 'Follower']);
        $followed = $this->activeUser(['name' => 'Followed']);

        $push = Mockery::mock(PushNotificationService::class);
        $push->shouldReceive('dispatch')
            ->once()
            ->withArgs(function (NotificationEventEnum $event, array $data, ?int $userId) use ($follower, $followed) {
                return $event === NotificationEventEnum::USER_FOLLOWED
                    && $data['actor_id'] === $follower->id
                    && $data['deep_link'] === '/notification-center'
                    && $userId === $followed->id;
            })
            ->andReturn(Mockery::mock(PushNotificationLog::class));
        $this->app->instance(PushNotificationService::class, $push);

        $this->actingAs($follower, 'api')
            ->postJson('/api/v1/users/'.$followed->id.'/follow')
            ->assertOk();
    }

    public function test_publishing_reel_notifies_followers_with_deep_link(): void
    {
        Notification::fake();

        $creator = $this->activeUser(['name' => 'Creator']);
        $followerA = $this->activeUser(['name' => 'Follower A']);
        $followerB = $this->activeUser(['name' => 'Follower B']);
        $stranger = $this->activeUser(['name' => 'Stranger']);

        UserFollow::query()->create([
            'follower_id' => $followerA->id,
            'followed_user_id' => $creator->id,
        ]);
        UserFollow::query()->create([
            'follower_id' => $followerB->id,
            'followed_user_id' => $creator->id,
        ]);

        $reel = $this->makeVideoPost($creator, [
            'body' => 'Fresh upload',
            'status' => PostStatusEnum::Uploading,
            'visibility' => 'public',
            'published_at' => null,
            'original_path' => 'posts/videos/original/1/a.mp4',
        ]);

        app(PostService::class)->markOriginalUploaded($reel);

        Notification::assertSentTo($followerA, PostPublishedFollowerNotification::class, function ($notification) use ($reel, $creator) {
            $data = $notification->toArray($creator);

            return $data['type'] === 'post_published'
                && $data['post_id'] === $reel->id
                && $data['deep_link'] === PostPaths::deepLink($reel->id)
                && $data['actor_id'] === $creator->id;
        });
        Notification::assertSentTo($followerB, PostPublishedFollowerNotification::class);
        Notification::assertNotSentTo($stranger, PostPublishedFollowerNotification::class);
        Notification::assertNotSentTo($creator, PostPublishedFollowerNotification::class);
    }

    public function test_private_reel_publish_does_not_notify_followers(): void
    {
        Notification::fake();

        $creator = $this->activeUser();
        $follower = $this->activeUser();
        UserFollow::query()->create([
            'follower_id' => $follower->id,
            'followed_user_id' => $creator->id,
        ]);

        $reel = $this->makeVideoPost($creator, [
            'body' => 'Secret',
            'status' => PostStatusEnum::Uploading,
            'visibility' => 'private',
            'published_at' => null,
            'original_path' => 'posts/videos/original/1/a.mp4',
        ]);

        app(PostService::class)->markOriginalUploaded($reel);

        Notification::assertNothingSent();
    }

    public function test_publishing_reel_dispatches_push_to_each_follower(): void
    {
        Notification::fake();

        $creator = $this->activeUser(['name' => 'Creator']);
        $followerA = $this->activeUser();
        $followerB = $this->activeUser();
        UserFollow::query()->create([
            'follower_id' => $followerA->id,
            'followed_user_id' => $creator->id,
        ]);
        UserFollow::query()->create([
            'follower_id' => $followerB->id,
            'followed_user_id' => $creator->id,
        ]);

        $reel = $this->makeVideoPost($creator, [
            'body' => 'Push me',
            'status' => PostStatusEnum::Uploading,
            'visibility' => 'public',
            'published_at' => null,
            'original_path' => 'posts/videos/original/1/a.mp4',
        ]);

        $push = Mockery::mock(PushNotificationService::class);
        $push->shouldReceive('dispatch')
            ->twice()
            ->withArgs(function (NotificationEventEnum $event, array $data, ?int $userId) use ($reel, $creator, $followerA, $followerB) {
                return $event === NotificationEventEnum::POST_PUBLISHED
                    && $data['post_id'] === $reel->id
                    && $data['deep_link'] === PostPaths::deepLink($reel->id)
                    && $data['actor_id'] === $creator->id
                    && in_array($userId, [$followerA->id, $followerB->id], true);
            })
            ->andReturn(Mockery::mock(PushNotificationLog::class));
        $this->app->instance(PushNotificationService::class, $push);

        app(PostService::class)->markOriginalUploaded($reel);
    }

    public function test_repost_notifies_original_owner_with_deep_link(): void
    {
        Notification::fake();

        $owner = $this->activeUser(['name' => 'Owner']);
        $reposter = $this->activeUser(['name' => 'Reposter']);
        $reel = $this->readyReel($owner);

        $this->actingAs($reposter, 'api')
            ->postJson('/api/v1/posts/'.$reel->id.'/repost', [
                'visibility' => 'public',
            ])
            ->assertCreated();

        Notification::assertSentTo($owner, PostRepostedUserNotification::class, function ($notification) use ($reel, $reposter) {
            $data = $notification->toArray($reel->user);

            return $data['type'] === 'post_reposted'
                && $data['post_id'] === $reel->id
                && $data['deep_link'] === PostPaths::deepLink($reel->id)
                && $data['actor_id'] === $reposter->id;
        });
    }

    public function test_repost_dispatches_push_to_original_owner(): void
    {
        Notification::fake();

        $owner = $this->activeUser();
        $reposter = $this->activeUser();
        $reel = $this->readyReel($owner);

        $push = Mockery::mock(PushNotificationService::class);
        $push->shouldReceive('dispatch')
            ->once()
            ->withArgs(function (NotificationEventEnum $event, array $data, ?int $userId) use ($reel, $owner, $reposter) {
                return $event === NotificationEventEnum::POST_REPOSTED
                    && $data['post_id'] === $reel->id
                    && $data['deep_link'] === PostPaths::deepLink($reel->id)
                    && $data['actor_id'] === $reposter->id
                    && $userId === $owner->id;
            })
            ->andReturn(Mockery::mock(PushNotificationLog::class));
        $this->app->instance(PushNotificationService::class, $push);

        $this->actingAs($reposter, 'api')
            ->postJson('/api/v1/posts/'.$reel->id.'/repost', [
                'visibility' => 'public',
            ])
            ->assertCreated();
    }

    public function test_self_repost_does_not_notify_owner(): void
    {
        Notification::fake();

        $owner = $this->activeUser();
        $reel = $this->readyReel($owner);

        $this->actingAs($owner, 'api')
            ->postJson('/api/v1/posts/'.$reel->id.'/repost', [
                'visibility' => 'public',
            ])
            ->assertCreated();

        Notification::assertNotSentTo($owner, PostRepostedUserNotification::class);
    }
}
