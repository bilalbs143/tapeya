<?php

namespace App\Console\Commands;

use App\Services\Post\AutoEngagementService;
use Illuminate\Console\Command;

class ProcessAutoEngagementCommand extends Command
{
    protected $signature = 'posts:process-auto-engagement
                            {--reset-cursor : Reset chunk cursor to the start}';

    protected $description = 'Temporary: drip likes/views on the next chunk of public posts';

    public function handle(AutoEngagementService $service): int
    {
        if ($this->option('reset-cursor')) {
            $service->resetCursor();
            $this->info('Auto engagement cursor reset.');
        }

        $touched = $service->process();
        $remaining = $service->remainingUnderTargetCount();

        if ($remaining === 0) {
            $this->info("All posts at target. Touched {$touched} this run.");
        } else {
            $this->info("Touched {$touched} post(s). Remaining under target: {$remaining}.");
        }

        return self::SUCCESS;
    }
}
