<?php

namespace App\Services\Broadcast;

use App\Models\MatchGraphicSession;
use App\Models\TournamentMatch;
use App\Support\Scoring\MatchPendingState;

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

    public function syncForMatch(TournamentMatch $match): ?MatchGraphicSession
    {
        $session = FindMatchGraphicSession::forMatch($match);
        if (! $session) {
            return null;
        }

        $context = $this->contextBuilder->build($match, MatchPendingState::resolve($match));

        return $this->persister->persist($session, $context);
    }

    public function syncAndBroadcast(TournamentMatch $match): ?MatchGraphicSession
    {
        $session = $this->syncForMatch($match);
        if (! $session) {
            return null;
        }

        $this->broadcaster->broadcastActiveCommand($session);

        return $session;
    }

    /**
     * Apply a pending patch to matches.pending_crease, then sync overlay context if a session exists.
     *
     * @param  array<string, mixed>  $data
     */
    public function setPendingAndBroadcast(TournamentMatch $match, array $data): ?MatchGraphicSession
    {
        if ($match->exists) {
            MatchPendingState::merge($match, $data);
        }

        $session = FindMatchGraphicSession::forMatch($match);
        if (! $session) {
            return null;
        }

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
