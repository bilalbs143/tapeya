<?php

namespace App\Events\Broadcast;

use App\Streaming\Data\StreamPlayback;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Broadcast on the public channel `match.{matchId}.stream` when stream status changes.
 * Fans and the app can subscribe without auth — playback metadata only, no ingest secrets.
 */
class MatchStreamStatusUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly int $matchId,
        public readonly string $status,
        public readonly ?StreamPlayback $playback,
    ) {}

    /**
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel("match.{$this->matchId}.stream"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'match.stream.status.updated';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'status' => $this->status,
            'playback' => $this->playback ? [
                'mode' => $this->playback->mode,
                'url' => $this->playback->url,
                'embed_id' => $this->playback->embedId,
                'embed_url' => $this->playback->embedUrl,
                'player_options' => $this->playback->playerOptions,
            ] : null,
        ];
    }
}
