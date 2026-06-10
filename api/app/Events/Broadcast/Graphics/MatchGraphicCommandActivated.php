<?php

namespace App\Events\Broadcast\Graphics;

use App\Models\MatchGraphicCommand;
use App\Models\MatchGraphicSession;
use App\Models\TournamentMatch;
use App\Services\Broadcast\GraphicContextOrchestrator;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\App;

/**
 * Broadcast on the public channel `match.{matchId}.graphics` whenever the
 * active graphic command for a match changes.
 *
 * This is intentionally a **public** channel — the overlay page runs as an
 * OBS/vMix browser source with no user auth context, so it cannot join a
 * private channel. The broadcast carries command metadata, merged live
 * `context`, and a small session slice (`graphic_theme_id`, `config`,
 * `pending_players`) so the overlay cache stays aligned with the DB without
 * an extra HTTP round-trip.
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

    public ?array $context;

    public ?int $graphicThemeId;

    /** @var array<string, mixed>|null */
    public ?array $sessionConfig;

    /** @var array<string, mixed>|null */
    public ?array $pendingPlayers;

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
        $this->context = self::broadcastContext($session);
        $this->graphicThemeId = $session->graphic_theme_id !== null ? (int) $session->graphic_theme_id : null;
        $this->sessionConfig = is_array($session->config) ? $session->config : null;
        $this->pendingPlayers = is_array($session->pending_players) ? $session->pending_players : null;
    }

    /**
     * Full live context from the DB (same as {@see GraphicContextBuilder::build}),
     * merged over any persisted JSON so overlays never show stale `batters` / `bowler`
     * when a command activates — activating a command does not run {@see SyncMatchGraphicContextJob}.
     */
    private static function broadcastContext(MatchGraphicSession $session): ?array
    {
        $match = $session->relationLoaded('match')
            ? $session->getRelation('match')
            : TournamentMatch::query()->find($session->match_id);

        if (! $match instanceof TournamentMatch) {
            $base = is_array($session->context) ? $session->context : [];

            return $base !== [] ? $base : null;
        }

        return App::make(GraphicContextOrchestrator::class)
            ->mergeSessionContext($session, $match);
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
            'match_id' => $this->matchId,
            'session_id' => $this->sessionId,
            'command_id' => $this->commandId,
            'command_key' => $this->commandKey,
            'command_type' => $this->commandType,
            'display_mode' => $this->displayMode,
            'payload' => $this->payload,
            'context' => $this->context,
            'graphic_theme_id' => $this->graphicThemeId,
            'config' => $this->sessionConfig,
            'pending_players' => $this->pendingPlayers,
        ];
    }
}
