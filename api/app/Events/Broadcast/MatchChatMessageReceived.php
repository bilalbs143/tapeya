<?php

namespace App\Events\Broadcast;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

/**
 * Ephemeral chat message during a live match stream.
 *
 * ShouldBroadcastNow — inline, no queue, no DB write.
 * Channel: match.{matchId}.chat (public).
 */
final class MatchChatMessageReceived implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public readonly int $matchId,
        public readonly string $id,
        public readonly string $name,
        public readonly string $body,
        public readonly string $sentAt,
    ) {}

    /** @return array<int, Channel> */
    public function broadcastOn(): array
    {
        return [new Channel("match.{$this->matchId}.chat")];
    }

    public function broadcastAs(): string
    {
        return 'match.chat.message';
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
