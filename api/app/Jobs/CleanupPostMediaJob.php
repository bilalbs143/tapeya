<?php

namespace App\Jobs;

use App\Services\Post\PostMediaCleanupService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class CleanupPostMediaJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    /** @var list<int> */
    public array $backoff = [60, 120, 300];

    public int $timeout = 300;

    /**
     * @param  array{paths: list<string>, hls_dir: string|null, post_id: int}  $snapshot
     */
    public function __construct(
        public array $snapshot
    ) {
        $this->onQueue(config('posts.queues.default', 'reels'));
    }

    public function handle(PostMediaCleanupService $cleanup): void
    {
        $cleanup->deleteSnapshot($this->snapshot);
    }
}
