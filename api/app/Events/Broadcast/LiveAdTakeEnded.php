<?php

namespace App\Events\Broadcast;

use App\Models\LiveAdTake;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LiveAdTakeEnded implements ShouldBroadcastNow
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
        return new self($streamId, LiveAdTakeStarted::payload($take));
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
        return 'live-ad-take.ended';
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
