<?php

namespace App\Services\Post;

use App\Events\Broadcast\Post\PostProcessingUpdated;
use App\Models\Post;
use App\Support\Media\MediaDisk;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\Process\Process;

/**
 * Fast poster-frame extraction from the original upload (separate from heavy transcode).
 */
class PostPosterService
{
    /**
     * Extract a poster from the original, upload it, and broadcast so clients can refresh.
     * Never marks the reel failed — poster is best-effort.
     *
     * @param  bool  $force  Re-extract even when a thumbnail already exists.
     */
    public function extractAndStore(Post $post, bool $force = false): Post
    {
        $post->refresh();

        if (! $force && $post->videoRaw('thumbnail_path')) {
            return $post;
        }

        $originalPath = $post->videoRaw('original_path');
        if (! $originalPath || ! MediaDisk::exists($originalPath)) {
            Log::warning('Post poster skipped: original missing', ['post_id' => $post->id]);

            return $post;
        }

        $previousThumb = $post->videoRaw('thumbnail_path');
        $previousCover = $post->getRawOriginal('cover_path');

        $tmpDir = storage_path('app/tmp/reels-poster/'.$post->id);
        if (! is_dir($tmpDir) && ! mkdir($tmpDir, 0755, true) && ! is_dir($tmpDir)) {
            Log::warning('Post poster skipped: could not create temp dir', ['post_id' => $post->id]);

            return $post;
        }

        $ext = pathinfo($originalPath, PATHINFO_EXTENSION) ?: 'bin';
        $localOriginal = $tmpDir.'/original.'.$ext;
        $localPoster = $tmpDir.'/poster.webp';

        try {
            file_put_contents($localOriginal, MediaDisk::disk()->get($originalPath));

            $meta = $this->probeVideo($localOriginal);
            $durationMs = $meta['duration_ms'];
            $seek = $durationMs !== null && $durationMs > 2000
                ? min(max($durationMs / 1000 * 0.1, 0.5), 5.0)
                : 1.0;

            $ok = $this->runFfmpeg([
                '-y',
                '-ss', (string) $seek,
                '-i', $localOriginal,
                '-frames:v', '1',
                '-vf', $this->posterFilter($localOriginal, $seek, $meta['width'], $meta['height']),
                '-c:v', 'libwebp',
                '-quality', '82',
                $localPoster,
            ], 60);

            if (! $ok || ! is_file($localPoster)) {
                Log::warning('Post poster extraction produced no file', ['post_id' => $post->id]);

                return $post;
            }

            $posterKey = 'posts/videos/thumbs/'.$post->id.'/'.Str::uuid().'.webp';
            MediaDisk::put($posterKey, file_get_contents($localPoster), [
                'ContentType' => 'image/webp',
            ]);

            $updates = ['thumbnail_path' => $posterKey];
            if ($durationMs !== null && ! $post->video?->duration_ms) {
                $updates['duration_ms'] = $durationMs;
            }

            $post->fillVideo($updates);
            $post->forceFill(['cover_path' => $posterKey])->save();

            foreach (array_unique(array_filter([$previousThumb, $previousCover])) as $oldKey) {
                if (is_string($oldKey) && $oldKey !== '' && $oldKey !== $posterKey) {
                    MediaDisk::delete($oldKey);
                }
            }

            event(new PostProcessingUpdated($post->fresh(['video']) ?? $post));

            return $post->fresh(['video']) ?? $post;
        } catch (\Throwable $e) {
            Log::warning('Post poster extraction failed', [
                'post_id' => $post->id,
                'error' => $e->getMessage(),
            ]);

            return $post->fresh() ?? $post;
        } finally {
            $this->cleanupDir($tmpDir);
        }
    }

    /**
     * cropdetect (letterbox/pillarbox) → edge trim → even dimensions.
     */
    private function posterFilter(string $input, float $seek, ?int $width, ?int $height): string
    {
        $parts = [];

        if (config('posts.poster.cropdetect', true)) {
            $crop = $this->detectCrop($input, $seek, $width, $height);
            if ($crop) {
                $parts[] = "crop={$crop}";
            }
        }

        $trim = max(0, (int) config('posts.poster.edge_trim_px', 2));
        if ($trim > 0) {
            $parts[] = sprintf('crop=iw-%d:ih-%d:%d:%d', $trim * 2, $trim * 2, $trim, $trim);
        }

        $parts[] = 'scale=trunc(iw/2)*2:trunc(ih/2)*2';

        return implode(',', $parts);
    }

    private function detectCrop(string $input, float $seek, ?int $width, ?int $height): ?string
    {
        $process = new Process([
            config('posts.ffmpeg_path', 'ffmpeg'),
            '-hide_banner',
            '-ss', (string) $seek,
            '-i', $input,
            '-frames:v', '24',
            '-vf', 'cropdetect=24:2:0',
            '-f', 'null',
            '-',
        ]);
        $process->setTimeout(45);
        $process->run();

        if (! preg_match_all('/crop=(\d+:\d+:\d+:\d+)/', $process->getErrorOutput().$process->getOutput(), $m)) {
            return null;
        }

        $crop = $m[1][array_key_last($m[1])];
        [$w, $h] = array_map('intval', explode(':', $crop));

        if ($w < 32 || $h < 32) {
            return null;
        }

        // Skip no-op / absurd detections.
        if ($width && $height) {
            if ($w >= $width - 1 && $h >= $height - 1) {
                return null;
            }
            if ($w < (int) ($width * 0.5) || $h < (int) ($height * 0.5)) {
                return null;
            }
        }

        return $crop;
    }

    /**
     * @return array{duration_ms: ?int, width: ?int, height: ?int}
     */
    private function probeVideo(string $localPath): array
    {
        $process = new Process([
            config('posts.ffprobe_path', 'ffprobe'),
            '-v', 'quiet',
            '-print_format', 'json',
            '-show_format',
            '-show_streams',
            '-select_streams', 'v:0',
            $localPath,
        ]);
        $process->setTimeout(30);
        $process->run();

        if (! $process->isSuccessful()) {
            return ['duration_ms' => null, 'width' => null, 'height' => null];
        }

        /** @var array<string, mixed> $json */
        $json = json_decode($process->getOutput(), true) ?? [];
        $stream = $json['streams'][0] ?? [];
        $durationSec = isset($json['format']['duration']) ? (float) $json['format']['duration'] : null;

        return [
            'duration_ms' => $durationSec !== null ? (int) round($durationSec * 1000) : null,
            'width' => ((int) ($stream['width'] ?? 0)) ?: null,
            'height' => ((int) ($stream['height'] ?? 0)) ?: null,
        ];
    }

    /** @param  list<string>  $args */
    private function runFfmpeg(array $args, int $timeout): bool
    {
        $process = new Process([config('posts.ffmpeg_path', 'ffmpeg'), ...$args]);
        $process->setTimeout($timeout);
        $process->run();

        if (! $process->isSuccessful()) {
            Log::warning('ffmpeg poster failed', ['error' => $process->getErrorOutput()]);

            return false;
        }

        return true;
    }

    private function cleanupDir(string $dir): void
    {
        if (! is_dir($dir)) {
            return;
        }

        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::CHILD_FIRST
        );

        foreach ($iterator as $file) {
            $path = $file->getPathname();
            $file->isDir() ? @rmdir($path) : @unlink($path);
        }
        @rmdir($dir);
    }
}
