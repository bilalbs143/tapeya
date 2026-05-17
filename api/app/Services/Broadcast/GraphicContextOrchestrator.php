<?php

namespace App\Services\Broadcast;

use App\Models\MatchGraphicSession;
use App\Models\TournamentMatch;

/**
 * Wires session resolution, context building, persistence, and overlay broadcasts.
 * Domain computation lives in {@see GraphicContextBuilder} and {@see GraphicLiveStatsBuilder}.
 */
final class GraphicContextOrchestrator
{
    public function __construct(
        private readonly GraphicContextBuilder $contextBuilder,
        private readonly GraphicContextPersister $persister,
        private readonly GraphicBroadcaster $broadcaster,
    ) {}

    public function syncForMatch(TournamentMatch $match): MatchGraphicSession
    {
        $session = ResolveMatchGraphicSession::forMatch($match);
        $pending = $session->pending_players ?? [];
        $context = $this->contextBuilder->build($match, $pending);

        return $this->persister->persist($session, $context);
    }

    public function syncAndBroadcast(TournamentMatch $match): MatchGraphicSession
    {
        $session = $this->syncForMatch($match);
        $this->broadcaster->broadcastActiveCommand($session);

        return $session;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function setPendingAndBroadcast(TournamentMatch $match, array $data): MatchGraphicSession
    {
        $session = ResolveMatchGraphicSession::forMatch($match);
        $existing = $session->pending_players ?? [];

        $merged = $existing;
        foreach ($data as $key => $value) {
            if ($value !== null) {
                $merged[$key] = $value;
            } else {
                unset($merged[$key]);
            }
        }

        $session->update(['pending_players' => empty($merged) ? null : $merged]);

        return $this->syncAndBroadcast($match);
    }

    /**
     * @return array<string, mixed>
     */
    public function mergeSessionContext(MatchGraphicSession $session, TournamentMatch $match): array
    {
        return $this->contextBuilder->mergeSessionContext($session, $match);
    }
}
