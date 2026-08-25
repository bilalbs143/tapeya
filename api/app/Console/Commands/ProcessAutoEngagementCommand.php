<?php

namespace App\Console\Commands;

use App\Services\Post\AutoEngagementService;
use Illuminate\Console\Command;

class ProcessAutoEngagementCommand extends Command
{
    protected $signature = 'posts:process-auto-engagement
                            {--reset-cursor : Reset chunk cursor to the start}';

    protected $description = 'Drip random daily likes/views on fresh public posts (toward soft lifetime)';

    public function handle(AutoEngagementService $service): int
    {
        if ($this->option('reset-cursor')) {
            $service->resetCursor();
            $this->info('Auto engagement cursor reset.');
        }

        $touched = $service->process();
        $remaining = $service->remainingUnderTargetCount();

        if ($remaining === 0) {
            $this->info("All eligible posts at soft lifetime (or outside freshness). Touched {$touched} this run.");
        } else {
            $this->info("Touched {$touched} post(s). Remaining under soft lifetime: {$remaining}.");
        }

        return self::SUCCESS;
    }
}
