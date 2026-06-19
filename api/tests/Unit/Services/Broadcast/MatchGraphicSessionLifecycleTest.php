<?php

namespace Tests\Unit\Services\Broadcast;

use App\Models\MatchGraphicSession;
use App\Models\TournamentMatch;
use App\Services\Broadcast\FindMatchGraphicSession;
use App\Services\Broadcast\GraphicContextOrchestrator;
use Tests\TestCase;

class MatchGraphicSessionLifecycleTest extends TestCase
{
    public function test_find_returns_null_when_session_missing(): void
    {
        $match = new TournamentMatch;
        $match->setRelation('graphicSession', null);

        $this->assertNull(FindMatchGraphicSession::forMatch($match));
    }

    public function test_find_returns_existing_session_without_creating(): void
    {
        $session = new MatchGraphicSession(['id' => 42]);
        $match = new TournamentMatch;
        $match->setRelation('graphicSession', $session);

        $this->assertSame($session, FindMatchGraphicSession::forMatch($match));
    }

    public function test_orchestrator_sync_is_no_op_without_session(): void
    {
        $match = new TournamentMatch;
        $match->setRelation('graphicSession', null);

        $orchestrator = app(GraphicContextOrchestrator::class);

        $this->assertNull($orchestrator->syncForMatch($match));
        $this->assertNull($orchestrator->syncAndBroadcast($match));
        $this->assertNull($orchestrator->setPendingAndBroadcast($match, ['next_bowler_id' => 1]));
    }
}
