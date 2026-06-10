<?php

namespace App\Console\Commands;

use App\Models\PushNotificationLog;
use Illuminate\Console\Command;

class PurgeOldPushNotificationLogsCommand extends Command
{
    protected $signature = 'push-notifications:purge-old-logs
                            {--days=7 : Delete logs whose created_at is older than this many days}';

    protected $description = 'Delete push notification delivery logs older than the retention window (default 7 days).';

    public function handle(): int
    {
        $days = max(1, (int) $this->option('days'));
        $cutoff = now()->subDays($days);

        $deleted = PushNotificationLog::query()
            ->where('created_at', '<', $cutoff)
            ->delete();

        $this->info("Deleted {$deleted} push_notification_logs row(s) created before {$cutoff->toIso8601String()}.");

        return self::SUCCESS;
    }
}
