<?php

namespace Tests\Feature\Console;

use App\Enums\Notification\AdminNotificationTypeEnum;
use App\Models\MatchStream;
use App\Notifications\BroadcastConcurrencyAlertAdminNotification;
use App\Notifications\YouTubeQuotaAlertAdminNotification;
use App\Settings\StreamingSettings;
use App\Streaming\Support\YouTubeQuotaTracker;
use App\Utils\Services\SystemUserService;
use Database\Seeders\SystemSettingsSeeder;
use Database\Seeders\SystemUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

/**
 * Phase 5 operational monitoring (LIVE_STREAM_MOBILE_BROADCAST.md) — concurrency + YouTube
 * quota alerts. No reporting/flagging feature exists in this product; this is the only
 * Phase 5 deliverable.
 */
class MonitorBroadcastOperationsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(SystemUserSeeder::class);
        $this->seed(SystemSettingsSeeder::class);
    }

    private function createConcurrentStreams(int $count): void
    {
        MatchStream::factory()->count($count)->create([
            'match_id' => null,
            'provider' => 'youtube',
            'status' => 'live',
        ]);
    }

    public function test_alerts_when_concurrent_broadcasts_at_or_above_threshold(): void
    {
        Notification::fake();
        $threshold = app(StreamingSettings::class)->concurrentBroadcastAlertThreshold;
        $this->createConcurrentStreams($threshold);

        Artisan::call('broadcasts:monitor-operations');

        $systemUser = SystemUserService::get();
        Notification::assertSentTo($systemUser, BroadcastConcurrencyAlertAdminNotification::class);
    }

    public function test_no_concurrency_alert_when_below_threshold(): void
    {
        Notification::fake();
        $threshold = app(StreamingSettings::class)->concurrentBroadcastAlertThreshold;
        $this->createConcurrentStreams(max(0, $threshold - 1));

        Artisan::call('broadcasts:monitor-operations');

        Notification::assertNothingSent();
    }

    public function test_concurrency_alert_does_not_repeat_while_breach_persists(): void
    {
        Notification::fake();
        $threshold = app(StreamingSettings::class)->concurrentBroadcastAlertThreshold;
        $this->createConcurrentStreams($threshold);

        Artisan::call('broadcasts:monitor-operations');
        Artisan::call('broadcasts:monitor-operations');

        $systemUser = SystemUserService::get();
        Notification::assertSentToTimes($systemUser, BroadcastConcurrencyAlertAdminNotification::class, 1);
    }

    public function test_concurrency_alert_fires_again_after_recovering_then_rebreaching(): void
    {
        Notification::fake();
        $threshold = app(StreamingSettings::class)->concurrentBroadcastAlertThreshold;
        $this->createConcurrentStreams($threshold);

        Artisan::call('broadcasts:monitor-operations');

        MatchStream::query()->update(['status' => 'ended']);
        Artisan::call('broadcasts:monitor-operations');

        $this->createConcurrentStreams($threshold);
        Artisan::call('broadcasts:monitor-operations');

        $systemUser = SystemUserService::get();
        Notification::assertSentToTimes($systemUser, BroadcastConcurrencyAlertAdminNotification::class, 2);
    }

    public function test_alerts_when_quota_usage_at_or_above_threshold_percent(): void
    {
        Notification::fake();
        $settings = app(StreamingSettings::class);
        $budget = $settings->dailyYoutubeQuotaBudget;
        $percentThreshold = $settings->quotaAlertThresholdPercent;

        YouTubeQuotaTracker::record((int) ceil($budget * $percentThreshold / 100));

        Artisan::call('broadcasts:monitor-operations');

        $systemUser = SystemUserService::get();
        Notification::assertSentTo($systemUser, YouTubeQuotaAlertAdminNotification::class);
    }

    public function test_no_quota_alert_when_usage_below_threshold(): void
    {
        Notification::fake();
        YouTubeQuotaTracker::record(1);

        Artisan::call('broadcasts:monitor-operations');

        Notification::assertNothingSent();
    }

    public function test_concurrency_notification_payload_matches_enum_type(): void
    {
        Notification::fake();
        $threshold = app(StreamingSettings::class)->concurrentBroadcastAlertThreshold;
        $this->createConcurrentStreams($threshold);

        Artisan::call('broadcasts:monitor-operations');

        $systemUser = SystemUserService::get();
        Notification::assertSentTo(
            $systemUser,
            BroadcastConcurrencyAlertAdminNotification::class,
            function (BroadcastConcurrencyAlertAdminNotification $notification) use ($systemUser) {
                $data = $notification->toArray($systemUser);

                return $data['type'] === AdminNotificationTypeEnum::BROADCAST_CONCURRENCY_HIGH->value;
            },
        );
    }
}
