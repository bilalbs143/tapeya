<?php

namespace App\Events\Scoring;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Broadcast on the private channel `match.{matchId}.scoring` after every ball
 * mutation (store, update, delete).  Carries the complete MatchState so all
 * subscribers can update without additional API calls.
 *
 * Private channel — subscribers must authenticate via Sanctum (auth:api).
 * Scorers (app), scorecard viewers, and backoffice all join this channel.
 */
class MatchStateUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly int $matchId,
        public readonly array $matchState,
    ) {}

    /**
     * @return array<int, PrivateChannel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("match.{$this->matchId}.scoring"),
        ];
    }

    /** Echo listens with a leading dot: `.match.state.updated` */
    public function broadcastAs(): string
    {
        return 'match.state.updated';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'match_id' => $this->matchId,
            'match_state' => $this->matchState,
        ];
    }
}
