<?php

namespace App\Jobs;

use App\Models\Post;
use App\Services\Post\PostMediaCleanupService;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class CleanupPostOriginalJob implements ShouldBeUnique, ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    /** @var list<int> */
    public array $backoff = [60, 120, 300];

    public int $timeout = 300;

    public int $uniqueFor = 600;

    public function __construct(
        public int $postId
    ) {
        $this->onQueue(config('posts.queues.default', 'reels'));
    }

    public function uniqueId(): string
    {
        return (string) $this->postId;
    }

    public function handle(PostMediaCleanupService $cleanup): void
    {
        $post = Post::query()->find($this->postId);
        if (! $post) {
            return;
        }

        $cleanup->deleteOriginal($post);
    }
}
