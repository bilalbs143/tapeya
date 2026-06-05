<?php

namespace App\Events\Broadcast;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

/**
 * Ephemeral heart reaction during a live match stream.
 *
 * ShouldBroadcastNow — inline, no queue, no DB write.
 * Channel: match.{matchId}.chat (same public channel as comments).
 */
final class MatchHeartReceived implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(public readonly int $matchId) {}

    /** @return array<int, Channel> */
    public function broadcastOn(): array
    {
        return [new Channel("match.{$this->matchId}.chat")];
    }

    public function broadcastAs(): string
    {
        return 'match.chat.heart';
    }

    /** @return array<string, mixed> */
    public function broadcastWith(): array
    {
        return [];
    }
}
