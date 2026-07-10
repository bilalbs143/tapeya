<?php

namespace App\Events\Broadcast;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

/**
 * Ephemeral chat message during a live stream.
 *
 * Channel: live-stream.{streamId}.chat (public).
 */
final class LiveStreamChatMessageReceived implements ShouldBroadcastNow
{
    use Dispatchable;

    public function __construct(
        public readonly int $streamId,
        public readonly string $id,
        public readonly string $name,
        public readonly string $body,
        public readonly string $sentAt,
    ) {}

    /** @return array<int, Channel> */
    public function broadcastOn(): array
    {
        return [new Channel("live-stream.{$this->streamId}.chat")];
    }

    public function broadcastAs(): string
    {
        return 'live-stream.chat.message';
    }

    /** @return array<string, mixed> */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'text' => $this->body,
            'sent_at' => $this->sentAt,
        ];
    }
}
