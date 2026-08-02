<?php

namespace Tests\Concerns;

use App\Enums\Post\PostStatusEnum;
use App\Enums\Post\PostTypeEnum;
use App\Enums\Post\PostVisibilityEnum;
use App\Models\Post;
use App\Models\User;

trait CreatesVideoPosts
{
    /** @var list<string> */
    private const VIDEO_COLUMNS = [
        'original_path',
        'processed_path',
        'thumbnail_path',
        'preview_path',
        'hls_master_path',
        'playback_variants',
        'duration_ms',
        'width',
        'height',
        'file_size_bytes',
        'processing_error',
        'ready_at',
        'abr_complete',
    ];

    /**
     * @param  array<string, mixed>  $attrs  Post + optional video columns mixed
     */
    protected function makeVideoPost(User $user, array $attrs = []): Post
    {
        $videoAttrs = [];
        foreach (self::VIDEO_COLUMNS as $col) {
            if (array_key_exists($col, $attrs)) {
                $videoAttrs[$col] = $attrs[$col];
                unset($attrs[$col]);
            }
        }

        $post = Post::query()->create(array_merge([
            'user_id' => $user->id,
            'type' => PostTypeEnum::Video,
            'status' => PostStatusEnum::Ready,
            'visibility' => PostVisibilityEnum::Public,
            'published_at' => now(),
            'body' => null,
        ], $attrs));

        $status = $post->status instanceof PostStatusEnum
            ? $post->status
            : PostStatusEnum::tryFrom((string) $post->status);

        // Discovery feeds omit videos without a poster. Default a thumb for tests unless set/cleared.
        if (! array_key_exists('thumbnail_path', $videoAttrs)) {
            $videoAttrs['thumbnail_path'] = 'posts/videos/thumbs/test-'.$post->id.'.webp';
        }

        // Ready videos need HLS for explore/following discovery.
        if (! array_key_exists('hls_master_path', $videoAttrs) && $status === PostStatusEnum::Ready) {
            $videoAttrs['hls_master_path'] = 'posts/videos/hls/test-'.$post->id.'/master.m3u8';
        }

        $post->video()->create($videoAttrs);

        return $post->fresh(['video']) ?? $post->load('video');
    }
}
