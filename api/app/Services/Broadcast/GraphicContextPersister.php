<?php

namespace App\Services\Broadcast;

use App\Models\MatchGraphicSession;

/**
 * Persists computed graphic `context` JSON on {@see MatchGraphicSession}.
 */
final class GraphicContextPersister
{
    public function persist(MatchGraphicSession $session, array $context): MatchGraphicSession
    {
        $session->update(['context' => $context]);
        $session->refresh();
        $session->loadMissing('activeCommand');

        return $session;
    }
}
