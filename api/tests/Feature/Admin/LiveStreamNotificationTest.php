<?php

namespace Tests\Feature\Admin;

use App\Enums\Push\NotificationEventEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\LiveStream;
use App\Models\PushNotificationLog;
use App\Models\User;
use App\Models\YoutubeStreamKey;
use App\Services\Push\PushNotificationService;
use App\Settings\PushSettings;
use App\Streaming\StreamProviderManager;
use Database\Seeders\PushNotificationTemplateSeeder;
use Database\Seeders\SystemSettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Mockery;
use Tests\Support\Streaming\CreatesTestMatch;
use Tests\Support\Streaming\FakeStreamProvider;
use Tests\TestCase;

class LiveStreamNotificationTest extends TestCase
{
    use CreatesTestMatch;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(SystemSettingsSeeder::class);
        $this->seed(PushNotificationTemplateSeeder::class);
        $this->app->make(StreamProviderManager::class)->extend('youtube', fn () => new FakeStreamProvider);
    }

    private function admin(): User
    {
        return User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);
    }

    private function youtubeKey(User $admin): YoutubeStreamKey
    {
        return YoutubeStreamKey::create([
            'title' => 'Test Rig',
            'youtube_stream_id' => 'fake-yt-stream-'.uniqid(),
            'ingest_rtmp_url' => 'rtmp://a.rtmp.youtube.com/live2',
            'stream_key_encrypted' => Crypt::encryptString('fake-stream-key'),
            'is_active' => true,
            'created_by' => $admin->id,
        ]);
    }

    private function mockPushService(): object
    {
        $push = Mockery::mock(PushNotificationService::class);
        $this->app->instance(PushNotificationService::class, $push);

        return $push;
    }

    public function test_creating_standalone_stream_does_not_notify(): void
    {
        $admin = $this->admin();
        $push = $this->mockPushService();

        $push->shouldReceive('notifyLiveStreamStarted')->never();

        $this->actingAs($admin, 'api')->postJson('/api/v1/admin/live-streams', [
            'title' => 'Studio Show',
            'streaming_url' => 'https://example.com/watch',
        ])->assertCreated();
    }

    public function test_creating_match_linked_stream_does_not_notify(): void
    {
        $admin = $this->admin();
        $match = $this->createMatch();
        $key = $this->youtubeKey($admin);
        $push = $this->mockPushService();

        $push->shouldReceive('notifyLiveStreamStarted')->never();

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/matches/{$match->id}/stream", ['youtube_stream_key_id' => $key->id])
            ->assertCreated();
    }

    public function test_going_live_on_external_stream_notifies_all_users(): void
    {
        $admin = $this->admin();
        $push = $this->mockPushService();

        $push->shouldReceive('notifyLiveStreamStarted')->never();

        $response = $this->actingAs($admin, 'api')->postJson('/api/v1/admin/live-streams', [
            'title' => 'Studio Show',
            'streaming_url' => 'https://example.com/watch',
        ])->assertCreated();

        $streamId = (int) $response->json('data.stream.id');

        $push->shouldReceive('notifyLiveStreamStarted')
            ->once()
            ->withArgs(fn (LiveStream $stream, ?int $sentBy) => $stream->id === $streamId && $sentBy === $admin->id)
            ->andReturn(Mockery::mock(PushNotificationLog::class));

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/live-streams/{$streamId}/start")
            ->assertOk()
            ->assertJsonPath('data.status', 'live');
    }

    public function test_going_live_twice_does_not_renotify(): void
    {
        $admin = $this->admin();
        $push = $this->mockPushService();

        $response = $this->actingAs($admin, 'api')->postJson('/api/v1/admin/live-streams', [
            'title' => 'Studio Show',
            'streaming_url' => 'https://example.com/watch',
        ])->assertCreated();

        $streamId = (int) $response->json('data.stream.id');

        $push->shouldReceive('notifyLiveStreamStarted')->once()->andReturn(Mockery::mock(PushNotificationLog::class));

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/live-streams/{$streamId}/start")
            ->assertOk();

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/live-streams/{$streamId}/start")
            ->assertOk();
    }

    public function test_notification_content_is_live_on_tapeya_when_started(): void
    {
        app(PushSettings::class)->fill(['enabled' => 1, 'provider' => 'fcm'])->save();

        $admin = $this->admin();

        $response = $this->actingAs($admin, 'api')->postJson('/api/v1/admin/live-streams', [
            'title' => 'Championship Final',
            'streaming_url' => 'https://example.com/watch',
        ])->assertCreated();

        $streamId = $response->json('data.stream.id');

        $this->assertNull(
            PushNotificationLog::query()->where('template_key', NotificationEventEnum::LIVE_STREAM_CREATED->value)->first()
        );

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/live-streams/{$streamId}/start")
            ->assertOk();

        $log = PushNotificationLog::query()->where('template_key', NotificationEventEnum::LIVE_STREAM_CREATED->value)->firstOrFail();

        $this->assertSame('Championship Final is live on Tapeya', $log->title);
        $this->assertSame('Open the Tapeya app now and enjoy endless live action.', $log->body);
        $this->assertSame('all', $log->target_type->value);
        $this->assertNull($log->target_user_id);
        $this->assertSame($admin->id, $log->sent_by_user_id);
        $this->assertSame($streamId, $log->data['stream_id'] ?? null);
        $this->assertSame("/live/broadcast/{$streamId}", $log->data['deep_link'] ?? null);
        $this->assertSame(NotificationEventEnum::LIVE_STREAM_CREATED->value, $log->data['type'] ?? null);
    }
}
