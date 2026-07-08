<?php

namespace App\Events\Broadcast;

use App\Http\Resources\User\LiveStreamResource;
use App\Models\MatchStream;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Broadcast on the private `live-hub` channel whenever any stream's status changes, so the
 * Home page's live section and the `/live` hub list update instantly — no polling wait, no
 * manual refresh. Fired from the same place as LiveStreamStatusUpdated (same status change,
 * wider audience): that event is scoped to viewers already on one stream's page and keyed by
 * `streamId`; this one has no such prerequisite, since the whole point is announcing streams
 * the client doesn't already know about.
 *
 * Requires auth:api at the WebSocket handshake — same visibility bar as GET /live/matches —
 * so unlisted YouTube embed IDs in LiveStreamResource are not available to anonymous Reverb
 * subscribers who only know the public app key.
 */
class LiveHubUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly MatchStream $stream,
        public readonly bool $visibleInApp,
    ) {}

    /**
     * @return array<int, PrivateChannel>
     */
    public function broadcastOn(): array
    {
        return [new PrivateChannel('live-hub')];
    }

    public function broadcastAs(): string
    {
        return 'live-hub.updated';
    }

    /**
     * Same shape as one row of `GET /live/matches` (LiveStreamResource) — the client splices
     * this straight into that query's RTK cache rather than refetching the whole list.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        if ($this->stream->isSelfServe()) {
            $this->stream->loadMissing('owner');
        }

        $this->stream->loadMissing(['match.homeTeam', 'match.awayTeam', 'match.tournament']);

        return [
            'visible' => $this->visibleInApp,
            'stream' => (new LiveStreamResource($this->stream))->resolve(),
        ];
    }
}
