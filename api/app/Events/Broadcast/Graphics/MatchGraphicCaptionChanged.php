<?php

namespace App\Events\Broadcast\Graphics;

use App\Models\MatchGraphicSession;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Fired on the same public graphics channel whenever a caption is saved or deleted.
 * The backoffice listens and refreshes its caption list so all open controller
 * tabs stay in sync without a full page reload.
 */
class MatchGraphicCaptionChanged implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $matchId;

    /** 'saved' | 'deleted' */
    public string $action;

    public function __construct(MatchGraphicSession $session, string $action)
    {
        $this->matchId = $session->match_id;
        $this->action = $action;
    }

    /** @return array<int, Channel> */
    public function broadcastOn(): array
    {
        return [new Channel("match.{$this->matchId}.graphics")];
    }

    public function broadcastAs(): string
    {
        return 'match.graphic.caption.changed';
    }

    /** @return array<string, mixed> */
    public function broadcastWith(): array
    {
        return [
            'match_id' => $this->matchId,
            'action' => $this->action,
        ];
    }
}
