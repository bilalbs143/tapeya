<?php

namespace App\Console\Commands;

use App\Services\Post\AutoCommentService;
use Illuminate\Console\Command;

class ProcessAutoCommentsCommand extends Command
{
    protected $signature = 'posts:process-auto-comments
                            {--reset-cursor : Reset chunk cursor to the start}';

    protected $description = 'Drip sparse natural comments on public posts from dormant accounts';

    public function handle(AutoCommentService $service): int
    {
        if ($this->option('reset-cursor')) {
            $service->resetCursor();
            $this->info('Auto comments cursor reset.');
        }

        $touched = $service->process();
        $remaining = $service->remainingEligibleCount();

        $this->info("Commented on {$touched} post(s). Remaining eligible: {$remaining}.");

        return self::SUCCESS;
    }
}
