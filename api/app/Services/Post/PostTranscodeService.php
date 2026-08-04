<?php

namespace App\Services\Post;

use App\Enums\Post\PostStatusEnum;
use App\Events\Broadcast\Post\PostProcessingUpdated;
use App\Jobs\CleanupPostOriginalJob;
use App\Models\Post;
use App\Settings\PostsSettings;
use App\Support\Media\MediaDisk;
use App\Support\Post\PostAbrLadder;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\Process\Process;

class PostTranscodeService
{
    public function __construct(private readonly PostsSettings $settings) {}

    /**
     * Ready posts that still need remaining ABR rungs (e.g. worker timeout after early-ready).
     */
    public function needsAbrCompletion(Post $post): bool
    {
        if ($post->status !== PostStatusEnum::Ready) {
            return false;
        }

        if ((bool) $post->videoRaw('abr_complete')) {
            return false;
        }

        $originalPath = $post->videoRaw('original_path');

        return filled($originalPath) && MediaDisk::exists((string) $originalPath);
    }

    /**
     * Probe + ABR ladder → local MP4 intermediate per rung → HLS-only delivery.
     * Marks the post ready after the first HLS variant; finishes the ladder in the same job.
     * Poster is usually already set by {@see PostPosterService}; extract only as fallback.
     * Safe to re-enter for Ready posts with abr_complete=false (skips finished HLS rungs).
     */
    public function process(Post $post): Post
    {
        $disk = MediaDisk::disk();
        $originalPath = $post->videoRaw('original_path');

        if (! $originalPath || ! MediaDisk::exists($originalPath)) {
            if ($post->status !== PostStatusEnum::Ready) {
                app(PostService::class)->markFailed($post, 'Original video file is missing.');
            }

            return $post->fresh();
        }

        $tmpDir = storage_path('app/tmp/reels/'.$post->id);
        if (! is_dir($tmpDir) && ! mkdir($tmpDir, 0755, true) && ! is_dir($tmpDir)) {
            if ($post->status !== PostStatusEnum::Ready) {
                app(PostService::class)->markFailed($post, 'Could not create temp directory for transcoding.');
            }

            return $post->fresh();
        }

        $extension = pathinfo($originalPath, PATHINFO_EXTENSION) ?: 'bin';
        $localOriginal = $tmpDir.'/original.'.$extension;
        $localPoster = $tmpDir.'/poster.webp';
        $encodeId = $this->resolveEncodeId($post) ?? (string) Str::uuid();
        $markedReady = false;

        try {
            file_put_contents($localOriginal, $disk->get($originalPath));

            $meta = $this->probe($localOriginal);
            $this->assertDurationAllowed($meta['duration_ms'] ?? null);

            $post->refresh();
            $existingPoster = $post->videoRaw('thumbnail_path');
            if (! $existingPoster) {
                $this->extractPoster($localOriginal, $localPoster, $meta['duration_ms'] ?? null);
            }

            $rungs = PostAbrLadder::rungsForSource(
                config('posts.ladder', []),
                $meta['height'] ?? null
            );

            $doneHeights = $this->completedHlsHeights($post);
            $existingVariants = is_array($post->videoRaw('playback_variants'))
                ? array_values($post->videoRaw('playback_variants'))
                : [];
            // Delivery is HLS-only; keep only HLS variant rows when resuming.
            $variants = array_values(array_filter(
                $existingVariants,
                static fn ($variant) => ($variant['type'] ?? null) === 'hls'
            ));
            $hlsVariants = $this->hlsVariantsFromPlayback($variants);
            $topHeight = $post->video?->height;
            $topWidth = $post->video?->width;
            $hlsMasterKey = $post->videoRaw('hls_master_path');
            $markedReady = $post->status === PostStatusEnum::Ready && filled($hlsMasterKey);
            $firstReady = $post->video?->ready_at === null;
            $thumb = null;
            if (! $existingPoster && is_file($localPoster)) {
                $thumb = 'posts/videos/thumbs/'.$post->id.'/'.Str::uuid().'.webp';
                MediaDisk::put($thumb, file_get_contents($localPoster), [
                    'ContentType' => 'image/webp',
                ]);
            } else {
                $thumb = $existingPoster;
            }

            $sourceWidth = $meta['width'] ?? null;
            $sourceHeight = $meta['height'] ?? null;

            foreach ($rungs as $rung) {
                $height = $rung['height'];
                if (in_array($height, $doneHeights, true)) {
                    continue;
                }

                $localProcessed = $tmpDir."/processed_{$height}.mp4";
                $localHlsDir = $tmpDir.'/hls_'.$height;

                // Local MP4 is an encode scratch file only — not uploaded as progressive delivery.
                $this->transcodeRung($localOriginal, $localProcessed, $rung);

                $scaledWidth = $sourceWidth && $sourceHeight
                    ? (int) max(2, round($sourceWidth * ($height / max(1, $sourceHeight)) / 2) * 2)
                    : null;

                $topHeight = $height;
                $topWidth = $scaledWidth;

                $this->packageAndUploadHlsVariant(
                    $localProcessed,
                    $localHlsDir,
                    $post->id,
                    $encodeId,
                    $height,
                    (string) ($rung['audio_bitrate'] ?? '128k')
                );

                $hlsVariants[] = [
                    'height' => $height,
                    'width' => $scaledWidth,
                    'bandwidth' => $rung['bandwidth'],
                    'playlist' => $height.'p/index.m3u8',
                ];
                $variants[] = [
                    'quality' => $height.'p',
                    'path' => 'posts/videos/hls/'.$post->id.'/'.$encodeId.'/'.$height.'p/index.m3u8',
                    'type' => 'hls',
                    'bandwidth' => $rung['bandwidth'],
                    'width' => $scaledWidth,
                    'height' => $height,
                ];

                $hlsMasterKey = $this->writeAndUploadMaster($post->id, $encodeId, $hlsVariants);

                // Early ready after the first HLS rung so playback can start while higher rungs finish.
                if (! $markedReady) {
                    $post->forceFill([
                        'status' => PostStatusEnum::Ready,
                        'published_at' => $post->published_at ?? now(),
                        'cover_path' => $thumb ?: $post->cover_path,
                    ])->save();

                    $post->fillVideo([
                        'processed_path' => null,
                        'thumbnail_path' => $thumb ?: $post->videoRaw('thumbnail_path'),
                        'hls_master_path' => $hlsMasterKey,
                        'playback_variants' => $variants,
                        'duration_ms' => $meta['duration_ms'] ?? $post->video?->duration_ms,
                        'width' => $topWidth ?? $sourceWidth ?? $post->video?->width,
                        'height' => $topHeight ?? $sourceHeight ?? $post->video?->height,
                        'processing_error' => null,
                        'ready_at' => now(),
                        'abr_complete' => false,
                    ]);

                    if ($firstReady) {
                        app(PostService::class)->markReadyCounters($post->fresh(['video']) ?? $post);
                    } else {
                        event(new PostProcessingUpdated($post->fresh(['video']) ?? $post));
                    }

                    $markedReady = true;
                }
            }

            if (! $markedReady) {
                throw new \RuntimeException('No ABR HLS rungs were produced.');
            }

            // Final DB sync after full ladder (HLS master only).
            $post->fillVideo([
                'processed_path' => null,
                'thumbnail_path' => $thumb ?: $post->videoRaw('thumbnail_path'),
                'hls_master_path' => $hlsMasterKey,
                'playback_variants' => $variants,
                'width' => $topWidth ?? $sourceWidth ?? $post->video?->width,
                'height' => $topHeight ?? $sourceHeight ?? $post->video?->height,
                'abr_complete' => true,
            ]);

            event(new PostProcessingUpdated($post->fresh(['video']) ?? $post));

            // Original is only needed until HLS ABR finishes — drop it immediately.
            CleanupPostOriginalJob::dispatch($post->id);

            return $post->fresh(['video']);
        } catch (\Throwable $e) {
            Log::error('Post transcode failed', [
                'post_id' => $post->id,
                'message' => $e->getMessage(),
                'marked_ready' => $markedReady,
            ]);

            $post->refresh();
            $alreadyPlayable = $markedReady
                || (
                    $post->status === PostStatusEnum::Ready
                    && filled($post->videoRaw('hls_master_path'))
                );

            // Early-ready posts must stay playable if a later ABR rung fails.
            if ($alreadyPlayable) {
                Log::warning('ABR ladder incomplete; keeping early-ready post playable', [
                    'post_id' => $post->id,
                    'message' => $e->getMessage(),
                ]);

                $post->fillVideo([
                    'abr_complete' => false,
                ]);

                return $post->fresh(['video']);
            }

            // Not ready yet — rethrow so the queue can retry (tries/backoff).
            throw $e;
        } finally {
            $this->cleanupDir($tmpDir);
        }
    }

    /**
     * @return list<int>
     */
    private function completedHlsHeights(Post $post): array
    {
        $variants = $post->videoRaw('playback_variants');
        if (! is_array($variants)) {
            return [];
        }

        $heights = [];
        foreach ($variants as $variant) {
            if (($variant['type'] ?? null) !== 'hls') {
                continue;
            }
            if (preg_match('/^(\d+)p$/', (string) ($variant['quality'] ?? ''), $m)) {
                $heights[] = (int) $m[1];
            }
        }

        return array_values(array_unique($heights));
    }

    /**
     * @param  list<array<string, mixed>>  $variants
     * @return list<array{height: int, width: ?int, bandwidth: int, playlist: string}>
     */
    private function hlsVariantsFromPlayback(array $variants): array
    {
        $out = [];
        foreach ($variants as $variant) {
            if (($variant['type'] ?? null) !== 'hls') {
                continue;
            }
            if (! preg_match('/^(\d+)p$/', (string) ($variant['quality'] ?? ''), $m)) {
                continue;
            }
            $height = (int) $m[1];
            $out[] = [
                'height' => $height,
                'width' => isset($variant['width']) ? (int) $variant['width'] : null,
                'bandwidth' => (int) ($variant['bandwidth'] ?? 0),
                'playlist' => $height.'p/index.m3u8',
            ];
        }

        return $out;
    }

    private function resolveEncodeId(Post $post): ?string
    {
        $candidates = [
            $post->videoRaw('hls_master_path'),
        ];
        $variants = $post->videoRaw('playback_variants');
        if (is_array($variants)) {
            foreach ($variants as $variant) {
                if (! empty($variant['path'])) {
                    $candidates[] = $variant['path'];
                }
            }
        }

        $postId = (int) $post->id;
        foreach ($candidates as $path) {
            if (! is_string($path) || $path === '') {
                continue;
            }
            if (preg_match('#/hls/'.$postId.'/([^/]+)/#', $path, $m)) {
                return $m[1];
            }
        }

        return null;
    }

    /**
     * @return array{duration_ms: ?int, width: ?int, height: ?int}
     */
    private function probe(string $localPath): array
    {
        $ffprobe = config('posts.ffprobe_path', 'ffprobe');
        $process = new Process([
            $ffprobe,
            '-v', 'quiet',
            '-print_format', 'json',
            '-show_format',
            '-show_streams',
            $localPath,
        ]);
        $process->setTimeout(60);
        $process->run();

        if (! $process->isSuccessful()) {
            throw new \RuntimeException('ffprobe failed: '.$process->getErrorOutput());
        }

        /** @var array<string, mixed> $json */
        $json = json_decode($process->getOutput(), true) ?? [];
        $durationSec = isset($json['format']['duration']) ? (float) $json['format']['duration'] : null;

        $width = null;
        $height = null;
        foreach ($json['streams'] ?? [] as $stream) {
            if (($stream['codec_type'] ?? null) === 'video') {
                $width = isset($stream['width']) ? (int) $stream['width'] : null;
                $height = isset($stream['height']) ? (int) $stream['height'] : null;
                break;
            }
        }

        return [
            'duration_ms' => $durationSec !== null ? (int) round($durationSec * 1000) : null,
            'width' => $width,
            'height' => $height,
        ];
    }

    private function assertDurationAllowed(?int $durationMs): void
    {
        if ($durationMs === null) {
            return;
        }

        $minSeconds = $this->settings->minDurationSeconds;
        $maxSeconds = $this->settings->maxDurationSeconds;

        if ($minSeconds > 0 && $durationMs < $minSeconds * 1000) {
            throw new \RuntimeException('Video is shorter than the minimum allowed duration.');
        }

        if ($maxSeconds > 0 && $durationMs > ($maxSeconds * 1000) + 500) {
            throw new \RuntimeException('Video exceeds the maximum allowed duration.');
        }
    }

    /**
     * @param  array{height: int, crf: int, maxrate: string, bufsize: string, audio_bitrate: string}  $rung
     */
    private function transcodeRung(string $input, string $output, array $rung): void
    {
        $ffmpeg = config('posts.ffmpeg_path', 'ffmpeg');
        $cfg = config('posts.output', []);
        $height = (int) $rung['height'];

        $process = new Process([
            $ffmpeg,
            '-y',
            '-i', $input,
            '-c:v', $cfg['video_codec'] ?? 'libx264',
            '-preset', $cfg['preset'] ?? 'medium',
            '-profile:v', 'main',
            '-level', '4.0',
            '-crf', (string) ($rung['crf'] ?? $cfg['crf'] ?? 23),
            '-maxrate', $rung['maxrate'] ?? $cfg['maxrate'] ?? '2500k',
            '-bufsize', $rung['bufsize'] ?? $cfg['bufsize'] ?? '5000k',
            '-vf', "scale=-2:{$height}:force_original_aspect_ratio=decrease,pad=ceil(iw/2)*2:ceil(ih/2)*2",
            '-c:a', $cfg['audio_codec'] ?? 'aac',
            '-b:a', $rung['audio_bitrate'] ?? $cfg['audio_bitrate'] ?? '128k',
            '-ac', '2',
            '-ar', '48000',
            '-movflags', '+faststart',
            $output,
        ]);
        $process->setTimeout(900);
        $process->run();

        if (! $process->isSuccessful() || ! is_file($output)) {
            throw new \RuntimeException('ffmpeg transcode failed: '.$process->getErrorOutput());
        }
    }

    private function extractPoster(string $input, string $output, ?int $durationMs): void
    {
        $ffmpeg = config('posts.ffmpeg_path', 'ffmpeg');
        $seek = 1.0;
        if ($durationMs !== null && $durationMs > 2000) {
            $seek = min(max($durationMs / 1000 * 0.1, 0.5), 5.0);
        }

        $process = new Process([
            $ffmpeg,
            '-y',
            '-ss', (string) $seek,
            '-i', $input,
            '-frames:v', '1',
            '-c:v', 'libwebp',
            '-quality', '82',
            $output,
        ]);
        $process->setTimeout(60);
        $process->run();

        if (! $process->isSuccessful()) {
            Log::warning('Post poster extraction failed', ['error' => $process->getErrorOutput()]);
        }
    }

    /**
     * Package one ABR rung as VOD HLS under posts/videos/hls/{postId}/{encodeId}/{height}p/.
     */
    private function packageAndUploadHlsVariant(
        string $localProcessed,
        string $localHlsDir,
        int $postId,
        string $encodeId,
        int $height,
        string $audioBitrate = '128k'
    ): string {
        if (! is_dir($localHlsDir) && ! mkdir($localHlsDir, 0755, true) && ! is_dir($localHlsDir)) {
            throw new \RuntimeException("Could not create HLS temp dir for {$height}p.");
        }

        $ffmpeg = config('posts.ffmpeg_path', 'ffmpeg');
        $segmentSeconds = max(2, min(4, $this->settings->hlsSegmentSeconds));
        $playlist = $localHlsDir.'/index.m3u8';

        $process = new Process([
            $ffmpeg,
            '-y',
            '-i', $localProcessed,
            '-c:v', 'copy',
            '-c:a', 'aac',
            '-b:a', $audioBitrate,
            '-ac', '2',
            '-hls_time', (string) $segmentSeconds,
            '-hls_playlist_type', 'vod',
            '-hls_flags', 'independent_segments',
            '-hls_segment_filename', $localHlsDir.'/seg_%03d.ts',
            $playlist,
        ]);
        $process->setTimeout(300);
        $process->run();

        if (! $process->isSuccessful() || ! is_file($playlist)) {
            throw new \RuntimeException(
                "HLS packaging failed for {$height}p: ".$process->getErrorOutput()
            );
        }

        $remoteDir = 'posts/videos/hls/'.$postId.'/'.$encodeId.'/'.$height.'p';
        foreach (glob($localHlsDir.'/*') ?: [] as $file) {
            $basename = basename($file);
            $ext = strtolower(pathinfo($basename, PATHINFO_EXTENSION));
            $contentType = match ($ext) {
                'm3u8' => 'application/vnd.apple.mpegurl',
                'ts' => 'video/MP2T',
                'm4s' => 'video/iso.segment',
                'mp4' => 'video/mp4',
                default => 'application/octet-stream',
            };
            MediaDisk::put($remoteDir.'/'.$basename, file_get_contents($file), [
                'ContentType' => $contentType,
            ]);
        }

        return $height.'p/index.m3u8';
    }

    /**
     * @param  list<array{height: int, width?: int|null, bandwidth: int, playlist: string}>  $hlsVariants
     */
    private function writeAndUploadMaster(int $postId, string $encodeId, array $hlsVariants): string
    {
        $masterBody = PostAbrLadder::masterPlaylist($hlsVariants);
        $masterKey = 'posts/videos/hls/'.$postId.'/'.$encodeId.'/master.m3u8';
        // Same key is rewritten after each ABR rung; immutable Cache-Control would
        // pin an early (single-rung) master at the CDN for up to a year.
        MediaDisk::put($masterKey, $masterBody, [
            'ContentType' => 'application/vnd.apple.mpegurl',
            'CacheControl' => MediaDisk::HLS_MASTER_CACHE_CONTROL,
        ]);

        return $masterKey;
    }

    private function safeErrorMessage(\Throwable $e): string
    {
        $message = trim($e->getMessage());
        if ($message === '') {
            return 'Video processing failed.';
        }

        return Str::limit($message, 500);
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
            if ($file->isDir()) {
                @rmdir($path);
            } else {
                @unlink($path);
            }
        }
        @rmdir($dir);
    }
}
