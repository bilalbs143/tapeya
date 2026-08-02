<?php

namespace App\Http\Resources\User;

use App\Enums\Post\PostStatusEnum;
use App\Enums\Post\PostTypeEnum;
use App\Support\Media\MediaDisk;
use App\Support\Post\PostVisibilityGate;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Unified post JSON (reel surface keeps `caption` alias for body).
 *
 * Fields:
 * - id, type (text|image|video|repost), title, body, caption (=body)
 * - background_id (nullable; text posts only)
 * - status, visibility
 * - cover_url, media[] (when loaded), playback (video)
 * - repost_of (nested PostResource when type=repost)
 * - counts.{likes,comments,views,saves,shares,reposts}
 * - viewer.{liked,saved,following_creator}
 * - creator.{id,name,nickname,avatar_url,is_official}
 * - latest_comment.{id,body,created_at,user} (feed queries)
 * - hashtags[], published_at, created_at, ready_at
 * - upload (compose type=video only, added by FeedController)
 */
class PostResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $video = $this->relationLoaded('video') ? $this->video : $this->video()->first();
        $viewerId = $request->user()?->id;
        $playback = ($this->type === PostTypeEnum::Video || $this->type === null)
            ? $this->playbackPayload($viewerId !== null ? (int) $viewerId : null)
            : null;

        return [
            'id' => $this->id,
            'type' => $this->type?->value ?? PostTypeEnum::Video->value,
            'caption' => $this->body,
            'title' => $this->title,
            'body' => $this->body,
            'background_id' => $this->background_id,
            'status' => $this->status?->value ?? PostStatusEnum::Uploading->value,
            'visibility' => $this->visibility?->value ?? 'public',
            'duration_ms' => $video?->duration_ms,
            'width' => $video?->width,
            'height' => $video?->height,
            'processing_error' => $this->when(
                $request->user()?->id === $this->user_id,
                $video?->processing_error
            ),
            'cover_url' => MediaDisk::url($this->cover_path) ?? $this->thumbnailUrl(),
            'media' => $this->whenLoaded('media', function () {
                return $this->media->map(fn ($m) => [
                    'id' => $m->id,
                    'kind' => $m->kind,
                    'url' => MediaDisk::url($m->path),
                    'width' => $m->width,
                    'height' => $m->height,
                    'sort_order' => $m->sort_order,
                ])->values()->all();
            }),
            'playback' => $this->when($playback !== null, fn () => [
                'type' => $playback['type'],
                'url' => $playback['url'],
                'poster_url' => $this->thumbnailUrl(),
                'hls_url' => $playback['hls_url'],
                'is_processed' => $playback['is_processed'],
            ]),
            'repost_of' => $this->when(
                $this->type === PostTypeEnum::Repost && $this->relationLoaded('repostOf'),
                function () use ($request) {
                    $original = $this->repostOf;
                    if (! $original) {
                        return null;
                    }

                    $viewerId = $request->user()?->id;
                    if (! PostVisibilityGate::viewerCanSee($original, $viewerId !== null ? (int) $viewerId : null)) {
                        return $this->redactedRepostOf($original);
                    }

                    return (new self($original))->resolve($request);
                }
            ),
            'counts' => [
                'likes' => (int) $this->likes_count,
                'comments' => (int) $this->comments_count,
                'views' => (int) $this->views_count,
                'saves' => (int) $this->saves_count,
                'shares' => (int) $this->shares_count,
                'reposts' => (int) $this->reposts_count,
            ],
            'viewer' => [
                'liked' => (bool) ($this->viewer_liked ?? false),
                'saved' => (bool) ($this->viewer_saved ?? false),
                'following_creator' => (bool) ($this->viewer_following_creator ?? false),
            ],
            'creator' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user?->id,
                    'name' => $this->user?->name,
                    'nickname' => $this->user?->nickname,
                    'avatar_url' => MediaDisk::url($this->user?->avatar),
                    'is_official' => (bool) ($this->user?->is_official ?? false),
                ];
            }),
            'latest_comment' => $this->whenLoaded('latestComment', function () {
                $comment = $this->latestComment;
                if (! $comment) {
                    return null;
                }

                return [
                    'id' => $comment->id,
                    'body' => $comment->body,
                    'created_at' => $comment->created_at?->toIso8601String(),
                    'user' => $comment->relationLoaded('user') && $comment->user
                        ? [
                            'id' => $comment->user->id,
                            'name' => $comment->user->name,
                            'nickname' => $comment->user->nickname,
                            'avatar_url' => MediaDisk::url($comment->user->avatar),
                            'is_official' => (bool) $comment->user->is_official,
                        ]
                        : null,
                ];
            }),
            'hashtags' => $this->whenLoaded('hashtags', fn () => $this->hashtags->pluck('name')->values()->all()),
            'published_at' => $this->published_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'ready_at' => $video?->ready_at?->toIso8601String(),
        ];
    }

    /**
     * Nested original the viewer is not allowed to open.
     * No body/media/playback and no identity/timestamp disclosure (Private existence leak).
     *
     * @return array<string, mixed>
     */
    private function redactedRepostOf(mixed $original): array
    {
        return [
            'id' => $original->id,
            'type' => $original->type?->value ?? PostTypeEnum::Video->value,
            'unavailable' => true,
            'caption' => null,
            'title' => null,
            'body' => null,
            'background_id' => null,
            'cover_url' => null,
            'media' => null,
            'playback' => null,
            'creator' => null,
            'published_at' => null,
        ];
    }
}
