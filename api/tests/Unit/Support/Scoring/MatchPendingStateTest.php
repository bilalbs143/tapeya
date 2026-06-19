<?php

namespace Tests\Unit\Support\Scoring;

use App\Models\TournamentMatch;
use App\Support\Scoring\MatchPendingState;
use Tests\TestCase;

class MatchPendingStateTest extends TestCase
{
    public function test_resolve_returns_match_pending_crease(): void
    {
        $match = new TournamentMatch([
            'pending_crease' => [
                'next_batter_id' => 9,
                'next_non_striker_id' => 10,
                'substitute_replaced_id' => 5,
            ],
        ]);

        $this->assertSame([
            'next_batter_id' => 9,
            'next_non_striker_id' => 10,
            'substitute_replaced_id' => 5,
        ], MatchPendingState::resolve($match));
    }

    public function test_resolve_returns_empty_when_pending_crease_missing(): void
    {
        $this->assertSame([], MatchPendingState::resolve(new TournamentMatch));
    }
}
