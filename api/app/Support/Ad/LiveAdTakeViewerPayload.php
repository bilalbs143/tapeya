<?php

namespace App\Support\Ad;

use App\Enums\Post\PostTypeEnum;
use App\Models\LiveAdTake;
use App\Models\Post;
use App\Services\Ad\AdEligibilityService;
use App\Support\Media\MediaDisk;

/**
 * Watch-page / Reverb shape for an on-air live ad take.
 * Shared by stream bootstrap (`active_take`) and take.started / take.ended events.
 */
final class LiveAdTakeViewerPayload
{
    /**
     * @return array<string, mixed>
     */
    public static function fromTake(LiveAdTake $take): array
    {
        $take->loadMissing([
            'creative.campaign.brandPartner',
            'creative.post.media',
            'creative.post.video',
        ]);

        $creative = $take->creative;
        $post = $creative?->post;
        $envelope = $creative
            ? app(AdEligibilityService::class)->sponsorshipEnvelope($creative)
            : null;

        return [
            'id' => $take->id,
            'mode' => $take->mode?->value,
            'status' => $take->status?->value,
            'presentation' => $take->presentation_json,
            'note' => $take->note,
            'started_at' => $take->started_at?->toIso8601String(),
            'ended_at' => $take->ended_at?->toIso8601String(),
            'campaign_id' => $take->campaign_id,
            'creative_id' => $take->creative_id,
            'post_id' => $creative?->post_id,
            'surface' => $take->mode?->toSurface()->value,
            'sponsorship' => $envelope,
            'creative' => self::creativeBlock($creative?->id, $post),
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private static function creativeBlock(?int $creativeId, ?Post $post): ?array
    {
        if ($creativeId === null || $post === null) {
            return null;
        }

        $type = $post->type ?? PostTypeEnum::Text;
        $isVideo = $type === PostTypeEnum::Video;
        $playback = $isVideo ? $post->playbackPayload() : null;

        return [
            'id' => $creativeId,
            'post_id' => $post->id,
            'type' => $type->value,
            'body' => $post->body,
            'cover_url' => MediaDisk::url($post->cover_path) ?? $post->thumbnailUrl(),
            'media' => $post->relationLoaded('media')
                ? $post->media->map(fn ($m) => [
                    'id' => $m->id,
                    'kind' => $m->kind,
                    'url' => MediaDisk::url($m->path),
                    'width' => $m->width,
                    'height' => $m->height,
                    'sort_order' => $m->sort_order,
                ])->values()->all()
                : [],
            'playback' => $playback === null ? null : [
                'type' => $playback['type'],
                'url' => $playback['url'],
                'poster_url' => $post->thumbnailUrl(),
                'hls_url' => $playback['hls_url'],
                'is_processed' => $playback['is_processed'],
            ],
        ];
    }
}
