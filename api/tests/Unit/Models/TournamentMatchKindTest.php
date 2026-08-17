<?php

namespace Tests\Unit\Models;

use App\Enums\Event\CricketFormatEnum;
use App\Enums\Event\MatchKindEnum;
use App\Models\CricketMatch;
use App\Models\TournamentMatch;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use InvalidArgumentException;
use Tests\Support\QuickMatch\CreatesQuickMatch;
use Tests\Support\Scoring\BuildsScoringMatch;
use Tests\TestCase;

class TournamentMatchKindTest extends TestCase
{
    use BuildsScoringMatch;
    use CreatesQuickMatch;
    use RefreshDatabase;

    public function test_persists_quick_match_with_null_tournament_and_venue(): void
    {
        $owner = User::factory()->create(['type' => 'user', 'status' => 'active']);
        $match = $this->createQuickMatch($owner);

        $this->assertTrue($match->isQuick());
        $this->assertSame(MatchKindEnum::QUICK, $match->kind);
        $this->assertNull($match->tournament_id);
        $this->assertNull($match->venue_name);
        $this->assertSame(CricketFormatEnum::TAPE_BALL, $match->cricket_format);
        $this->assertSame((int) $owner->id, (int) $match->created_by);
        $this->assertNull($match->tournamentSummary());
        $this->assertTrue(is_a(CricketMatch::class, TournamentMatch::class, true));
        $this->assertInstanceOf(CricketMatch::class, $match);
    }

    public function test_tournament_summary_for_tournament_match(): void
    {
        $this->setUpScoringMatch();
        $summary = $this->scoringMatch->tournamentSummary();

        $this->assertIsArray($summary);
        $this->assertSame((int) $this->scoringMatch->tournament_id, $summary['id']);
        $this->assertSame('Test Cup', $summary['name']);
        $this->assertArrayHasKey('short_name', $summary);
        $this->assertArrayHasKey('logo_url', $summary);
    }

    public function test_empty_venue_name_is_stored_as_null(): void
    {
        $owner = User::factory()->create(['type' => 'user', 'status' => 'active']);
        $match = $this->createQuickMatch($owner, ['venue_name' => '']);

        $this->assertNull($match->fresh()->venue_name);
    }

    public function test_quick_match_without_created_by_fails_invariant(): void
    {
        $owner = User::factory()->create(['type' => 'user', 'status' => 'active']);

        $this->expectException(InvalidArgumentException::class);
        $this->createQuickMatch($owner, ['created_by' => null]);
    }

    public function test_tournament_match_defaults_to_tournament_kind(): void
    {
        $this->setUpScoringMatch();

        $this->assertFalse($this->scoringMatch->isQuick());
        $this->assertSame(MatchKindEnum::TOURNAMENT, $this->scoringMatch->fresh()->kind);
    }

    public function test_tournament_match_without_tournament_id_fails_invariant(): void
    {
        $this->setUpScoringMatch();

        $this->expectException(InvalidArgumentException::class);
        $this->scoringMatch->update(['tournament_id' => null]);
    }
}
