<?php

namespace App\Events\Broadcast;

use App\Models\LiveAdTake;
use App\Services\Ad\AdEligibilityService;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LiveAdTakeStarted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @param  array<string, mixed>  $takePayload
     */
    public function __construct(
        public readonly int $streamId,
        public readonly array $takePayload,
    ) {}

    public static function fromTake(LiveAdTake $take, int $streamId): self
    {
        return new self($streamId, self::payload($take));
    }

    /**
     * @return array<string, mixed>
     */
    public static function payload(LiveAdTake $take): array
    {
        $take->loadMissing(['creative.campaign.brandPartner', 'creative.post']);
        $creative = $take->creative;
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
            'sponsorship' => $envelope,
        ];
    }

    /**
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel("live-stream.{$this->streamId}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'live-ad-take.started';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'take' => $this->takePayload,
        ];
    }
}
