<?php

namespace App\Events\Broadcast\Graphics;

use App\Models\MatchGraphicCommand;
use App\Models\MatchGraphicSession;
use App\Models\TournamentMatch;
use App\Support\Broadcast\GraphicContextHash;
use App\Support\Scoring\MatchPendingState;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Broadcast on the public channel `match.{matchId}.graphics` whenever the
 * active graphic command for a match changes.
 *
 * This is intentionally a **public** channel — the graphics page runs as an
 * OBS/vMix browser source with no user auth context, so it cannot join a
 * private channel. The broadcast carries command metadata and
 * `context_hash` (not the full context blob) so overlays stay under the
 * Pusher payload limit and refetch context over HTTP when the hash changes.
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

    public ?int $graphicThemeId;

    /** @var array<string, mixed>|null */
    public ?array $sessionConfig;

    /** @var array<string, mixed>|null */
    public ?array $pendingPlayers;

    public ?string $contextHash;

    public function __construct(MatchGraphicSession $session, MatchGraphicCommand $command)
    {
        $this->matchId = $session->match_id;
        $this->sessionId = $session->id;
        $this->commandId = $command->id;
        $this->commandKey = $command->command_key instanceof \BackedEnum
            ? $command->command_key->value
            : (string) $command->command_key;
        $this->commandType = $command->command_type instanceof \BackedEnum
            ? $command->command_type->value
            : (string) $command->command_type;
        $this->displayMode = $command->display_mode instanceof \BackedEnum
            ? $command->display_mode->value
            : $command->display_mode;
        $this->payload = $command->payload;
        $this->contextHash = self::contextHashFromSession($session);
        $this->graphicThemeId = $session->graphic_theme_id !== null ? (int) $session->graphic_theme_id : null;
        $this->sessionConfig = is_array($session->config) ? $session->config : null;
        $this->pendingPlayers = null;
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
        $match = TournamentMatch::query()->with('graphicSession')->find($this->matchId);
        $pendingPlayers = $match ? MatchPendingState::resolve($match) : $this->pendingPlayers;
        if ($pendingPlayers === []) {
            $pendingPlayers = null;
        }

        return [
            'match_id' => $this->matchId,
            'session_id' => $this->sessionId,
            'command_id' => $this->commandId,
            'command_key' => $this->commandKey,
            'command_type' => $this->commandType,
            'display_mode' => $this->displayMode,
            'payload' => $this->payload,
            'context_hash' => $this->contextHash,
            'graphic_theme_id' => $this->graphicThemeId,
            'config' => $this->sessionConfig,
            'pending_players' => $pendingPlayers,
        ];
    }

    private static function contextHashFromSession(MatchGraphicSession $session): ?string
    {
        $context = is_array($session->context) ? $session->context : null;

        if ($context === null || $context === []) {
            return null;
        }

        return GraphicContextHash::hash($context);
    }
}
