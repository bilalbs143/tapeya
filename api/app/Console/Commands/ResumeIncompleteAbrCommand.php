<?php

namespace App\Console\Commands;

use App\Enums\Post\PostStatusEnum;
use App\Jobs\ProcessPostVideoJob;
use App\Models\Post;
use App\Support\Media\MediaDisk;
use Illuminate\Console\Command;

class ResumeIncompleteAbrCommand extends Command
{
    protected $signature = 'posts:resume-incomplete-abr
                            {--limit=50 : Max posts to re-queue}
                            {--dry-run : List candidates without dispatching}';

    protected $description = 'Re-queue Ready reels whose ABR ladder never finished (abr_complete=false)';

    public function handle(): int
    {
        $limit = max(1, (int) $this->option('limit'));
        $dryRun = (bool) $this->option('dry-run');

        $posts = Post::query()
            ->where('status', PostStatusEnum::Ready)
            ->whereHas('video', function ($q) {
                $q->where('abr_complete', false)
                    ->whereNotNull('original_path')
                    ->where('original_path', '!=', '');
            })
            ->with('video')
            ->orderBy('id')
            ->limit($limit)
            ->get();

        $queued = 0;
        foreach ($posts as $post) {
            $original = $post->videoRaw('original_path');
            if (! is_string($original) || $original === '' || ! MediaDisk::exists($original)) {
                $this->warn("Skip post #{$post->id}: original missing from storage");

                continue;
            }

            if ($dryRun) {
                $this->line("Would resume post #{$post->id}");
                $queued++;

                continue;
            }

            ProcessPostVideoJob::dispatch($post->id);
            $queued++;
        }

        $verb = $dryRun ? 'Would queue' : 'Queued';
        $this->info("{$verb} {$queued} post(s) for ABR resume.");

        return self::SUCCESS;
    }
}
