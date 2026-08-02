<?php

namespace App\Services\Post;

use App\Enums\Post\PostStatusEnum;
use App\Models\Post;
use App\Support\Media\MediaDisk;
use Illuminate\Support\Facades\Log;

class PostMediaCleanupService
{
    /**
     * Snapshot media keys for async cleanup after the reel row is hard-deleted.
     *
     * @return array{paths: list<string>, hls_dir: string|null, post_id: int}
     */
    public function snapshot(Post $post): array
    {
        $post->loadMissing(['video', 'media']);

        $paths = array_values(array_filter([
            $post->videoRaw('original_path'),
            $post->videoRaw('processed_path'),
            $post->videoRaw('thumbnail_path'),
            $post->videoRaw('preview_path'),
            $post->videoRaw('hls_master_path'),
            $post->cover_path,
        ]));

        foreach ($post->media ?? [] as $media) {
            if (! empty($media->path)) {
                $paths[] = $media->path;
            }
        }

        $paths = array_values(array_unique($paths));

        $hlsMaster = $post->videoRaw('hls_master_path');

        return [
            'post_id' => (int) $post->id,
            'paths' => $paths,
            // Encode dir (…/hls/{postId}/{encodeId}) when using ABR masters.
            'hls_dir' => $hlsMaster ? dirname((string) $hlsMaster) : null,
        ];
    }

    /**
     * @param  array{paths?: list<string>, hls_dir?: string|null, post_id?: int}  $snapshot
     */
    public function deleteSnapshot(array $snapshot): void
    {
        $postId = $snapshot['post_id'] ?? null;

        foreach ($snapshot['paths'] ?? [] as $path) {
            if (! is_string($path) || $path === '') {
                continue;
            }
            try {
                if (MediaDisk::exists($path)) {
                    MediaDisk::delete($path);
                }
            } catch (\Throwable $e) {
                Log::warning('Failed deleting reel media path', [
                    'post_id' => $postId,
                    'path' => $path,
                    'message' => $e->getMessage(),
                ]);
            }
        }

        $hlsDir = $snapshot['hls_dir'] ?? null;
        if (is_string($hlsDir) && $hlsDir !== '' && $hlsDir !== '.') {
            try {
                MediaDisk::deleteDirectory($hlsDir);
            } catch (\Throwable $e) {
                Log::warning('Failed deleting reel HLS directory', [
                    'post_id' => $postId,
                    'dir' => $hlsDir,
                    'message' => $e->getMessage(),
                ]);
            }
        }
    }

    public function deleteOriginal(Post $post): void
    {
        $path = $post->videoRaw('original_path');
        if (! $path) {
            return;
        }

        // Never remove the upload until HLS exists (needed for ABR resume).
        if (! filled($post->videoRaw('hls_master_path'))) {
            return;
        }

        try {
            if (MediaDisk::exists($path)) {
                MediaDisk::delete($path);
            }
        } catch (\Throwable $e) {
            Log::warning('Failed deleting reel original', [
                'post_id' => $post->id,
                'path' => $path,
                'message' => $e->getMessage(),
            ]);

            return;
        }

        $post->fillVideo(['original_path' => null]);
    }

    public function deleteAllMedia(Post $post): void
    {
        $this->deleteSnapshot($this->snapshot($post));

        $post->forceFill(['cover_path' => null])->save();
        $post->fillVideo([
            'original_path' => null,
            'processed_path' => null,
            'thumbnail_path' => null,
            'preview_path' => null,
            'hls_master_path' => null,
            'playback_variants' => null,
        ]);
    }

    /**
     * Safety net: delete originals that still linger after HLS is ready
     * (e.g. cleanup job failed after encode).
     */
    public function purgeExpiredOriginals(): int
    {
        $count = 0;

        Post::query()
            ->videosOnly()
            ->where('status', PostStatusEnum::Ready)
            ->whereHas('video', function ($q) {
                $q->whereNotNull('original_path')
                    ->whereNotNull('hls_master_path');
            })
            ->with('video')
            ->orderBy('id')
            ->chunkById(50, function ($posts) use (&$count) {
                foreach ($posts as $post) {
                    $this->deleteOriginal($post);
                    $count++;
                }
            });

        return $count;
    }
}
