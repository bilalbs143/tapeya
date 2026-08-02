<?php

namespace App\Http\Resources\Admin;

use App\Enums\Post\PostTypeEnum;
use App\Support\Media\MediaDisk;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Admin moderation payload for mixed post types (text | image | video | repost).
 * Keeps `caption` as a body alias for the existing backoffice client.
 */
class PostResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $type = $this->type?->value ?? PostTypeEnum::Video->value;
        $isVideo = $this->type === PostTypeEnum::Video || $this->type === null;
        $video = $this->relationLoaded('video') ? $this->video : null;
        // Staff preview matches owner: original while encoding, HLS when ready.
        $playback = $isVideo ? $this->playbackPayload((int) $this->user_id) : null;

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'type' => $type,
            'title' => $this->title,
            'body' => $this->body,
            'caption' => $this->body,
            'background_id' => $this->background_id,
            'status' => $this->status?->value,
            'visibility' => $this->visibility?->value,
            'duration_ms' => $video?->duration_ms,
            'width' => $video?->width,
            'height' => $video?->height,
            'processing_error' => $video?->processing_error,
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
                'original_url' => $this->originalUrl(),
                'is_processed' => $playback['is_processed'],
            ]),
            'counts' => [
                'likes' => (int) $this->likes_count,
                'comments' => (int) $this->comments_count,
                'views' => (int) $this->views_count,
                'saves' => (int) $this->saves_count,
                'shares' => (int) $this->shares_count,
                'reposts' => (int) $this->reposts_count,
                'reports' => (int) $this->reports_count,
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
            'ready_at' => $this->ready_at?->toIso8601String(),
            'published_at' => $this->published_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
