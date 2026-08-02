<?php

namespace App\Jobs;

use App\Enums\Post\PostStatusEnum;
use App\Models\Post;
use App\Services\Post\PostTranscodeService;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ProcessPostVideoJob implements ShouldBeUnique, ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    /** @var list<int> */
    public array $backoff = [60, 120, 300];

    public int $timeout = 1800;

    /** Cover full ABR timeout + backoff so duplicate dispatches coalesce. */
    public int $uniqueFor = 2400;

    public function __construct(
        public int $postId
    ) {
        $this->afterCommit = true;
        $this->onQueue(config('posts.queues.transcode', 'reels-transcode'));
        $this->timeout = (int) config('posts.transcode_timeout_seconds', 1800);
    }

    public function uniqueId(): string
    {
        return (string) $this->postId;
    }

    public function handle(PostTranscodeService $transcoder): void
    {
        $post = Post::query()->find($this->postId);

        if (! $post) {
            return;
        }

        if ($post->status === PostStatusEnum::Removed) {
            return;
        }

        if ($post->status === PostStatusEnum::Ready && ! $transcoder->needsAbrCompletion($post)) {
            return;
        }

        if (! $post->videoRaw('original_path')) {
            return;
        }

        $transcoder->process($post);
    }

    public function failed(?\Throwable $exception): void
    {
        $post = Post::query()->find($this->postId);
        if (! $post || $post->status === PostStatusEnum::Ready) {
            return;
        }

        $post->forceFill([
            'status' => PostStatusEnum::Failed,
            'processing_error' => $exception
                ? Str::limit($exception->getMessage(), 500)
                : 'Video processing failed after retries.',
        ])->save();

        Log::error('ProcessPostVideoJob permanently failed', [
            'post_id' => $this->postId,
            'message' => $exception?->getMessage(),
        ]);
    }
}
