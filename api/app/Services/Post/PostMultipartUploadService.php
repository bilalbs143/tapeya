<?php

namespace App\Services\Post;

use App\Models\Post;
use App\Settings\PostsSettings;
use App\Support\Media\MediaDisk;
use App\Support\Media\MediaWriteException;
use App\Support\Post\PostVideoFormats;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Chunked upload for large reel originals (assembles parts then stores as original_path).
 */
class PostMultipartUploadService
{
    public function __construct(private readonly PostsSettings $settings) {}

    /**
     * @return array{upload_id: string, part_size: int, max_parts: int}
     */
    public function initiate(Post $post): array
    {
        if ($post->videoRaw('original_path')) {
            throw ValidationException::withMessages([
                'reel' => ['Original already uploaded.'],
            ]);
        }

        $uploadId = (string) Str::uuid();
        $partSize = $this->settings->multipartPartSizeBytes();
        $maxParts = $this->settings->multipartMaxParts;

        Cache::put($this->cacheKey($post->id, $uploadId), [
            'post_id' => $post->id,
            'parts' => [],
            'created_at' => now()->toIso8601String(),
        ], now()->addHours(6));

        return [
            'upload_id' => $uploadId,
            'part_size' => $partSize,
            'max_parts' => $maxParts > 0 ? $maxParts : null,
        ];
    }

    /**
     * @return array{part_number: int, received: int}
     */
    public function storePart(Post $post, string $uploadId, int $partNumber, UploadedFile $file): array
    {
        $state = $this->requireState($post->id, $uploadId);
        $maxParts = $this->settings->multipartMaxParts;

        if ($partNumber < 1 || ($maxParts > 0 && $partNumber > $maxParts)) {
            throw ValidationException::withMessages([
                'part_number' => [$maxParts > 0
                    ? "Part number must be between 1 and {$maxParts}."
                    : 'Part number must be at least 1.'],
            ]);
        }

        $tmpDir = storage_path('app/tmp/reels-multipart/'.$post->id.'/'.$uploadId);
        if (! is_dir($tmpDir) && ! mkdir($tmpDir, 0755, true) && ! is_dir($tmpDir)) {
            throw ValidationException::withMessages([
                'upload' => ['Could not create temporary upload directory.'],
            ]);
        }

        $partPath = $tmpDir.'/part_'.str_pad((string) $partNumber, 5, '0', STR_PAD_LEFT);
        if (! copy($file->getRealPath(), $partPath)) {
            throw ValidationException::withMessages([
                'file' => ['Could not store upload part.'],
            ]);
        }

        $state['parts'][$partNumber] = $partPath;
        Cache::put($this->cacheKey($post->id, $uploadId), $state, now()->addHours(6));

        return [
            'part_number' => $partNumber,
            'received' => count($state['parts']),
        ];
    }

    public function complete(
        Post $post,
        string $uploadId,
        int $totalParts,
        ?string $clientFilename = null,
        ?string $clientContentType = null,
    ): Post {
        $state = $this->requireState($post->id, $uploadId);
        $parts = $state['parts'] ?? [];

        if (count($parts) !== $totalParts) {
            throw ValidationException::withMessages([
                'total_parts' => ['Not all parts have been uploaded yet.'],
            ]);
        }

        ksort($parts, SORT_NUMERIC);
        for ($i = 1; $i <= $totalParts; $i++) {
            if (! isset($parts[$i]) || ! is_file($parts[$i])) {
                throw ValidationException::withMessages([
                    'parts' => ["Missing part {$i}."],
                ]);
            }
        }

        $tmpDir = storage_path('app/tmp/reels-multipart/'.$post->id.'/'.$uploadId);
        $assembled = $tmpDir.'/assembled.bin';
        $out = fopen($assembled, 'wb');
        if ($out === false) {
            throw ValidationException::withMessages([
                'upload' => ['Could not assemble upload.'],
            ]);
        }

        try {
            foreach ($parts as $partFile) {
                $in = fopen($partFile, 'rb');
                if ($in === false) {
                    throw ValidationException::withMessages([
                        'upload' => ['Could not read uploaded part.'],
                    ]);
                }
                stream_copy_to_stream($in, $out);
                fclose($in);
            }
        } finally {
            fclose($out);
        }

        $maxMb = $this->settings->maxUploadMb;
        if ($maxMb > 0) {
            $sizeMb = filesize($assembled) / (1024 * 1024);
            if ($sizeMb > $maxMb) {
                @unlink($assembled);
                throw ValidationException::withMessages([
                    'file' => ["Video must be at most {$maxMb} MB."],
                ]);
            }
        }

        PostVideoFormats::assertLooksLikeVideo($assembled);

        $extension = PostVideoFormats::resolveExtension(
            $assembled,
            $clientFilename,
            $clientContentType,
        );
        $contentType = PostVideoFormats::contentTypeForExtension($extension);

        $key = 'posts/videos/original/'.$post->id.'/'.Str::uuid().'.'.$extension;

        try {
            MediaDisk::put($key, fopen($assembled, 'rb'), [
                'ContentType' => $contentType,
            ]);
        } catch (MediaWriteException $e) {
            throw ValidationException::withMessages([
                'file' => ['Video upload to storage failed. Please try again.'],
            ]);
        }

        $post->fillVideo(['original_path' => $key]);
        app(PostService::class)->markOriginalUploaded($post);

        Cache::forget($this->cacheKey($post->id, $uploadId));
        $this->cleanupDir($tmpDir);

        return $post->fresh(['video']) ?? $post;
    }

    public function abort(Post $post, string $uploadId): void
    {
        Cache::forget($this->cacheKey($post->id, $uploadId));
        $this->cleanupDir(storage_path('app/tmp/reels-multipart/'.$post->id.'/'.$uploadId));
    }

    /**
     * @return array{post_id: int, parts: array<int, string>, created_at?: string}
     */
    private function requireState(int $postId, string $uploadId): array
    {
        $state = Cache::get($this->cacheKey($postId, $uploadId));
        if (! is_array($state) || (int) ($state['post_id'] ?? 0) !== $postId) {
            throw ValidationException::withMessages([
                'upload_id' => ['Upload session expired or invalid.'],
            ]);
        }

        return $state;
    }

    private function cacheKey(int $postId, string $uploadId): string
    {
        return "reel:multipart:{$postId}:{$uploadId}";
    }

    private function cleanupDir(string $dir): void
    {
        if (! is_dir($dir)) {
            return;
        }

        foreach (glob($dir.'/*') ?: [] as $file) {
            @unlink($file);
        }
        @rmdir($dir);
        $parent = dirname($dir);
        if (is_dir($parent)) {
            @rmdir($parent);
        }
    }
}
