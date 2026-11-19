<?php

namespace App\Console\Commands;

use App\Services\Ad\AdStatsRollupService;
use Illuminate\Console\Command;

class RollupAdStatsCommand extends Command
{
    protected $signature = 'ads:rollup-stats
                            {--days=3 : Recompute stats for the last N days (late-event absorption)}';

    protected $description = 'Upsert ad_stats_daily aggregates from ad_events.';

    public function handle(AdStatsRollupService $rollup): int
    {
        $days = max(1, (int) $this->option('days'));
        $count = $rollup->rollup(now()->subDays($days)->startOfDay(), now());
        $this->info("Upserted {$count} ad_stats_daily row(s).");

        return self::SUCCESS;
    }
}
