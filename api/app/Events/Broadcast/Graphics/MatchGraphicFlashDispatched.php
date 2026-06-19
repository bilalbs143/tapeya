<?php

namespace App\Events\Broadcast\Graphics;

use App\Enums\Broadcast\GraphicCommandKeyEnum;
use App\Models\MatchGraphicSession;
use App\Support\Broadcast\GraphicContextHash;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Auto-flash event dispatched after a ball is stored (or cancelled after undo).
 *
 * Shares the public channel `match.{id}.graphics` with MatchGraphicCommandActivated.
 * Does NOT write to match_graphic_commands or mutate active_command_id.
 *
 * Payload (slim — no `context` blob):
 *   match_id     int
 *   ball_id      int          front-end uses this to match cancel signals
 *   commands     string[]     ordered GraphicCommandKeyEnum values; [] = cancel
 *   context_hash string|null  overlay refetches session when this changes
 */
class MatchGraphicFlashDispatched implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @param  GraphicCommandKeyEnum[]  $commands
     */
    public function __construct(
        public readonly int $matchId,
        public readonly int $ballId,
        public readonly array $commands,
        public readonly ?string $contextHash,
    ) {}

    /**
     * @param  GraphicCommandKeyEnum[]  $commands
     */
    public static function fromSession(
        MatchGraphicSession $session,
        int $ballId,
        array $commands,
    ): self {
        $context = is_array($session->context) ? $session->context : null;

        return new self(
            matchId: $session->match_id,
            ballId: $ballId,
            commands: $commands,
            contextHash: $context !== null && $context !== []
                ? GraphicContextHash::hash($context)
                : null,
        );
    }

    /**
     * @param  GraphicCommandKeyEnum[]  $commands
     */
    public static function dispatchFromSession(
        MatchGraphicSession $session,
        int $ballId,
        array $commands,
    ): void {
        event(self::fromSession($session, $ballId, $commands));
    }

    /**
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel("match.{$this->matchId}.graphics"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'match.graphic.flash';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'match_id' => $this->matchId,
            'ball_id' => $this->ballId,
            'commands' => array_map(
                fn (GraphicCommandKeyEnum $k) => $k->value,
                $this->commands,
            ),
            'context_hash' => $this->contextHash,
        ];
    }
}
