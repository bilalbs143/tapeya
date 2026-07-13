<?php

namespace App\Console\Commands;

use App\Models\MatchStream;
use App\Notifications\BroadcastConcurrencyAlertAdminNotification;
use App\Notifications\YouTubeQuotaAlertAdminNotification;
use App\Settings\AdminNotificationSettings;
use App\Settings\StreamingSettings;
use App\Streaming\Support\YouTubeQuotaTracker;
use App\Utils\Services\SystemUserService;
use Illuminate\Console\Command;
use Illuminate\Notifications\Notification as NotificationMessage;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Notification;

/**
 * Phase 5 operational monitoring (LIVE_STREAM_MOBILE_BROADCAST.md) — no reporting/flagging
 * feature exists in this product; this is purely ops visibility so staff notice a problem
 * (or abuse) before users do. Two checks, each alerted at most once per "breach episode"
 * (a cache flag suppresses repeat alerts while the condition persists, and clears once the
 * metric drops back below threshold so a later re-breach alerts again).
 */
class MonitorBroadcastOperations extends Command
{
    protected $signature = 'broadcasts:monitor-operations';

    protected $description = 'Alert admins when concurrent YouTube broadcasts or API quota usage run high';

    private const CONCURRENCY_FLAG_KEY = 'ops_alert:broadcast_concurrency_high';

    private const QUOTA_FLAG_KEY = 'ops_alert:youtube_quota_high';

    public function handle(StreamingSettings $settings, AdminNotificationSettings $adminNotificationSettings): int
    {
        $this->checkConcurrency($settings, $adminNotificationSettings);
        $this->checkQuota($settings, $adminNotificationSettings);

        return self::SUCCESS;
    }

    private function checkConcurrency(StreamingSettings $settings, AdminNotificationSettings $adminNotificationSettings): void
    {
        $threshold = $settings->concurrentBroadcastAlertThreshold;

        $concurrentCount = MatchStream::query()
            ->where('provider', 'youtube')
            ->whereIn('status', ['starting', 'live'])
            ->count();

        if ($concurrentCount < $threshold) {
            Cache::forget(self::CONCURRENCY_FLAG_KEY);

            return;
        }

        if (Cache::has(self::CONCURRENCY_FLAG_KEY)) {
            return;
        }

        Cache::put(self::CONCURRENCY_FLAG_KEY, true, now()->addDay());

        $this->notifyAdmins(
            new BroadcastConcurrencyAlertAdminNotification($concurrentCount, $threshold),
            $adminNotificationSettings,
        );
    }

    private function checkQuota(StreamingSettings $settings, AdminNotificationSettings $adminNotificationSettings): void
    {
        $budget = $settings->dailyYoutubeQuotaBudget;
        $used = YouTubeQuotaTracker::todayUsage();
        $percentUsed = $budget > 0 ? (int) round(($used / $budget) * 100) : 0;

        if ($percentUsed < $settings->quotaAlertThresholdPercent) {
            Cache::forget(self::QUOTA_FLAG_KEY);

            return;
        }

        if (Cache::has(self::QUOTA_FLAG_KEY)) {
            return;
        }

        // Same-day only — quota (and our tracked usage) resets at midnight anyway.
        Cache::put(self::QUOTA_FLAG_KEY, true, now()->endOfDay());

        $this->notifyAdmins(
            new YouTubeQuotaAlertAdminNotification($used, $budget, $percentUsed),
            $adminNotificationSettings,
        );
    }

    /**
     * Database notification for the System user (admin inbox) + mail to configured admin_emails —
     * same delivery pattern as every other *AdminNotification in this app.
     */
    private function notifyAdmins(NotificationMessage $notification, AdminNotificationSettings $adminNotificationSettings): void
    {
        $systemUser = SystemUserService::get();
        if ($systemUser) {
            $systemUser->notify($notification);
        }

        $configAdminEmails = $adminNotificationSettings->adminEmails;
        if (is_array($configAdminEmails)) {
            foreach ($configAdminEmails as $email) {
                if (is_string($email) && $email !== '') {
                    Notification::route('mail', $email)->notify($notification);
                }
            }
        }
    }
}
