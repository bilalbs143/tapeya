<?php

namespace App\Console\Commands;

use App\Services\Post\AutoLikeNotificationDigest;
use Illuminate\Console\Command;

class FlushAutoLikeDigestsCommand extends Command
{
    protected $signature = 'posts:flush-auto-like-digests
                            {--force : Flush all pending digests regardless of window}';

    protected $description = 'Flush combined auto-like digests (DB + push) after the debounce window';

    public function handle(AutoLikeNotificationDigest $digest): int
    {
        $flushed = $digest->flushDue((bool) $this->option('force'));
        $this->info("Flushed {$flushed} auto-like digest(s).");

        return self::SUCCESS;
    }
}
