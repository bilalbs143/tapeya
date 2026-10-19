<?php

namespace App\Console\Commands;

use App\Enums\Drama\DramaVideoSourceEnum;
use App\Jobs\OptimizeDramaEpisodeVideoJob;
use App\Models\DramaEpisode;
use Illuminate\Console\Command;

/**
 * Backfill progressive-playback optimize for already-uploaded episode MP4s.
 *
 *   php artisan drama:optimize-episode-videos
 *   php artisan drama:optimize-episode-videos --id=12
 */
class OptimizeDramaEpisodeVideosCommand extends Command
{
    protected $signature = 'drama:optimize-episode-videos
                            {--id= : Optimize a single drama episode id}
                            {--sync : Run inline instead of queueing}';

    protected $description = 'Remux uploaded drama episode MP4s with faststart for quick progressive playback';

    public function handle(): int
    {
        $query = DramaEpisode::query()
            ->where('video_source', DramaVideoSourceEnum::UPLOAD)
            ->whereNotNull('video')
            ->where('video', '!=', '');

        if ($id = $this->option('id')) {
            $query->whereKey((int) $id);
        }

        $ids = $query->pluck('id');
        if ($ids->isEmpty()) {
            $this->info('No uploaded episode videos to optimize.');

            return self::SUCCESS;
        }

        $sync = (bool) $this->option('sync');
        foreach ($ids as $episodeId) {
            if ($sync) {
                OptimizeDramaEpisodeVideoJob::dispatchSync((int) $episodeId);
                $this->line("Optimized episode #{$episodeId}");
            } else {
                OptimizeDramaEpisodeVideoJob::dispatch((int) $episodeId);
                $this->line("Queued episode #{$episodeId}");
            }
        }

        $this->info(($sync ? 'Optimized' : 'Queued').' '.$ids->count().' episode(s).');

        return self::SUCCESS;
    }
}
