<?php

namespace App\Events\Broadcast;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

/**
 * Ephemeral heart reaction during a live stream.
 *
 * Channel: live-stream.{streamId}.chat (same public channel as comments).
 */
final class LiveStreamHeartReceived implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public readonly int $streamId,
        public readonly int $userId,
        public readonly ?string $avatarUrl,
        public readonly string $initials,
    ) {}

    /** @return array<int, Channel> */
    public function broadcastOn(): array
    {
        return [new Channel("live-stream.{$this->streamId}.chat")];
    }

    public function broadcastAs(): string
    {
        return 'live-stream.chat.heart';
    }

    /** @return array<string, mixed> */
    public function broadcastWith(): array
    {
        return [
            'user_id' => $this->userId,
            'avatar_url' => $this->avatarUrl,
            'initials' => $this->initials,
        ];
    }
}
