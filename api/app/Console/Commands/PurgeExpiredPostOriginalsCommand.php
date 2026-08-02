<?php

namespace App\Console\Commands;

use App\Services\Post\PostMediaCleanupService;
use Illuminate\Console\Command;

class PurgeExpiredPostOriginalsCommand extends Command
{
    protected $signature = 'posts:purge-expired-originals';

    protected $description = 'Delete original reel uploads that still exist after HLS is ready';

    public function handle(PostMediaCleanupService $cleanup): int
    {
        $count = $cleanup->purgeExpiredOriginals();
        $this->info("Purged originals for {$count} reel(s).");

        return self::SUCCESS;
    }
}
