<?php

namespace App\Services\Broadcast;

use App\Models\MatchGraphicSession;
use App\Models\TournamentMatch;

/**
 * Explicit graphic-session creation — only invoked when a broadcaster saves settings.
 */
final class CreateMatchGraphicSession
{
    public function __construct(
        private readonly GraphicContextOrchestrator $graphicContextOrchestrator,
    ) {}

    /**
     * @param  array<string, mixed>  $config
     */
    public function create(
        TournamentMatch $match,
        int $graphicThemeId,
        array $config,
        ?int $userId,
    ): MatchGraphicSession {
        $session = MatchGraphicSession::query()->create([
            'match_id' => $match->id,
            'graphic_theme_id' => $graphicThemeId,
            'config' => $config,
            'context' => [],
            'created_by' => $userId,
            'updated_by' => $userId,
        ]);

        return $this->graphicContextOrchestrator->syncForMatch($match->fresh()) ?? $session->fresh();
    }
}
