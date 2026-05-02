<?php

namespace App\Events\Broadcast\Graphics;

use App\Models\MatchGraphicCommand;
use App\Models\MatchGraphicSession;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Broadcast on the public channel `match.{matchId}.graphics` whenever the
 * active graphic command for a match changes.
 *
 * This is intentionally a **public** channel — the overlay page runs as an
 * OBS/vMix browser source with no user auth context, so it cannot join a
 * private channel.  The payload carries no sensitive data (only command
 * key / type / display_mode / match_id).
 */
class MatchGraphicCommandActivated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $matchId;
    public string $commandKey;
    public string $commandType;
    public ?string $displayMode;
    public ?array $payload;
    public int $sessionId;
    public int $commandId;

    public function __construct(MatchGraphicSession $session, MatchGraphicCommand $command)
    {
        $this->matchId     = $session->match_id;
        $this->sessionId   = $session->id;
        $this->commandId   = $command->id;
        $this->commandKey  = $command->command_key instanceof \BackedEnum
            ? $command->command_key->value
            : (string) $command->command_key;
        $this->commandType = $command->command_type instanceof \BackedEnum
            ? $command->command_type->value
            : (string) $command->command_type;
        $this->displayMode = $command->display_mode;
        $this->payload     = $command->payload;
    }

    /**
     * Public channel — no authentication required on the subscriber side.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel("match.{$this->matchId}.graphics"),
        ];
    }

    /** Echo listens with a leading dot: `.match.graphic.activated` */
    public function broadcastAs(): string
    {
        return 'match.graphic.activated';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'match_id'     => $this->matchId,
            'session_id'   => $this->sessionId,
            'command_id'   => $this->commandId,
            'command_key'  => $this->commandKey,
            'command_type' => $this->commandType,
            'display_mode' => $this->displayMode,
            'payload'      => $this->payload,
        ];
    }
}
