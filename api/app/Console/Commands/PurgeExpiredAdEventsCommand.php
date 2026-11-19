<?php

namespace App\Console\Commands;

use App\Models\AdEvent;
use Illuminate\Console\Command;

class PurgeExpiredAdEventsCommand extends Command
{
    protected $signature = 'ads:purge-expired-events
                            {--days=90 : Delete events whose occurred_at is older than this many days}';

    protected $description = 'Delete ad_events older than the retention window (default 90 days).';

    public function handle(): int
    {
        $days = max(1, (int) $this->option('days'));
        $cutoff = now()->subDays($days);

        $deleted = AdEvent::query()
            ->where('occurred_at', '<', $cutoff)
            ->delete();

        $this->info("Deleted {$deleted} ad_events row(s) with occurred_at before {$cutoff->toIso8601String()}.");

        return self::SUCCESS;
    }
}
