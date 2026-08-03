<?php

namespace App\Jobs;

use App\Enums\Post\PostStatusEnum;
use App\Models\Post;
use App\Services\Post\PostPosterService;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

/**
 * Fast path: extract poster WebP before / alongside heavy transcode so grids light up early.
 * When $forceRefine is true, overwrites a provisional client thumbnail after the original lands.
 */
class ExtractPostPosterJob implements ShouldBeUnique, ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    /** @var list<int> */
    public array $backoff = [15, 45, 90];

    public int $timeout = 90;

    /** Keep uniqueness while queued/running through the job timeout + retry window. */
    public int $uniqueFor = 300;

    public function __construct(
        public int $postId,
        public bool $forceRefine = false,
    ) {
        $this->afterCommit = true;
        $this->onQueue(config('posts.queues.poster', 'reels-poster'));
    }

    public function uniqueId(): string
    {
        return (string) $this->postId;
    }

    public function handle(PostPosterService $posters): void
    {
        $post = Post::query()->find($this->postId);
        if (! $post) {
            return;
        }

        if ($post->status === PostStatusEnum::Removed) {
            return;
        }

        if (! $this->forceRefine && $post->videoRaw('thumbnail_path')) {
            return;
        }

        if (! $post->videoRaw('original_path')) {
            return;
        }

        $posters->extractAndStore($post, $this->forceRefine);
    }

    public function failed(?\Throwable $exception): void
    {
        // Poster is best-effort — never mark the reel failed.
        Log::warning('ExtractPostPosterJob permanently failed', [
            'post_id' => $this->postId,
            'message' => $exception?->getMessage(),
        ]);
    }
}
