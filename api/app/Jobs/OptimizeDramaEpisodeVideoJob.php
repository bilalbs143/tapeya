<?php

namespace App\Jobs;

use App\Models\DramaEpisode;
use App\Services\Drama\DramaEpisodeVideoOptimizeService;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class OptimizeDramaEpisodeVideoJob implements ShouldBeUnique, ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    /** @var list<int> */
    public array $backoff = [30, 60, 120];

    public int $timeout = 1800;

    public int $uniqueFor = 2400;

    public function __construct(
        public int $episodeId
    ) {
        $this->afterCommit = true;
        // Same worker pool as reel/post ffmpeg jobs (ffmpeg must be on PATH).
        $this->onQueue(config('posts.queues.transcode', 'reels-transcode'));
    }

    public function uniqueId(): string
    {
        return (string) $this->episodeId;
    }

    public function handle(DramaEpisodeVideoOptimizeService $optimizer): void
    {
        $episode = DramaEpisode::query()->find($this->episodeId);
        if (! $episode) {
            return;
        }

        $optimizer->optimize($episode);
    }

    public function failed(?\Throwable $exception): void
    {
        Log::error('OptimizeDramaEpisodeVideoJob permanently failed', [
            'episode_id' => $this->episodeId,
            'message' => $exception?->getMessage(),
        ]);
    }
}
