<?php

namespace App\Services\Post;

use App\Enums\Post\PostStatusEnum;
use App\Models\Post;
use App\Support\Media\MediaDisk;

/**
 * Resolve playback / poster URLs for video posts.
 *
 * Delivery model:
 * - Ready (HLS present): HLS-only.
 * - Owner + still encoding: temporary progressive play of the original upload.
 * - Everyone else before HLS: no playable URL (poster only; discovery waits for HLS).
 */
class PostPlaybackUrlService
{
    /**
     * @return array{type: string, url: string|null, hls_url: string|null, is_processed: bool}
     */
    public function playbackPayload(Post $post, ?int $viewerId = null): array
    {
        $hls = $this->hlsUrl($post);
        if ($hls) {
            return [
                'type' => 'hls',
                'url' => $hls,
                'hls_url' => $hls,
                'is_processed' => true,
            ];
        }

        if ($this->viewerMayStreamOriginal($post, $viewerId)) {
            $original = $this->originalUrl($post);
            if ($original) {
                return [
                    'type' => 'original',
                    'url' => $original,
                    'hls_url' => null,
                    'is_processed' => false,
                ];
            }
        }

        return [
            'type' => 'hls',
            'url' => null,
            'hls_url' => null,
            'is_processed' => false,
        ];
    }

    /**
     * Primary playable URL for the given viewer (HLS, else owner original, else null).
     */
    public function playbackUrl(Post $post, ?int $viewerId = null): ?string
    {
        return $this->playbackPayload($post, $viewerId)['url'];
    }

    public function originalUrl(Post $post): ?string
    {
        $path = $post->videoRaw('original_path');

        return $path ? $this->urlForPath($path) : null;
    }

    public function hlsUrl(Post $post): ?string
    {
        $path = $post->videoRaw('hls_master_path');

        return $path ? $this->urlForPath($path) : null;
    }

    public function posterUrl(Post $post): ?string
    {
        $path = $post->videoRaw('thumbnail_path') ?: $post->cover_path;

        return $path ? $this->urlForPath($path) : null;
    }

    /**
     * True when the post has deliverable HLS media.
     */
    public function isProcessed(Post $post): bool
    {
        return filled($post->videoRaw('hls_master_path'));
    }

    private function viewerMayStreamOriginal(Post $post, ?int $viewerId): bool
    {
        if ($viewerId === null || (int) $post->user_id !== $viewerId) {
            return false;
        }

        $status = $post->status instanceof PostStatusEnum
            ? $post->status
            : PostStatusEnum::tryFrom((string) $post->status);

        return in_array($status, [PostStatusEnum::Processing, PostStatusEnum::Uploading], true);
    }

    private function urlForPath(string $path): ?string
    {
        if ($path === '' || $path === '0') {
            return null;
        }

        return MediaDisk::url($path);
    }
}
