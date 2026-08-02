<?php

namespace App\Console\Commands;

use App\Services\Post\PostViewCounterBuffer;
use Illuminate\Console\Command;

class FlushPostViewCountersCommand extends Command
{
    protected $signature = 'posts:flush-view-counters';

    protected $description = 'Flush Redis-buffered reel view counters into the database';

    public function handle(PostViewCounterBuffer $buffer): int
    {
        $count = $buffer->flush();
        $this->info("Flushed view counters for {$count} reel(s).");

        return self::SUCCESS;
    }
}
