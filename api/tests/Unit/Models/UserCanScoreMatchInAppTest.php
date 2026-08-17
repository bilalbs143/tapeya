<?php

namespace Tests\Unit\Models;

use App\Models\Tournament;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use ReflectionMethod;
use Tests\Support\QuickMatch\CreatesQuickMatch;
use Tests\Support\Scoring\BuildsScoringMatch;
use Tests\TestCase;

class UserCanScoreMatchInAppTest extends TestCase
{
    use BuildsScoringMatch;
    use CreatesQuickMatch;
    use RefreshDatabase;

    public function test_can_operate_tournament_in_app_signature_stays_non_nullable(): void
    {
        $param = (new ReflectionMethod(User::class, 'canOperateTournamentInApp'))->getParameters()[0];
        $type = $param->getType();

        $this->assertNotNull($type);
        $this->assertFalse($type->allowsNull());
        $this->assertSame(Tournament::class, $type->getName());
    }

    public function test_quick_match_owner_can_score_without_calling_tournament_staff(): void
    {
        $owner = User::factory()->create(['type' => 'user', 'status' => 'active']);
        $match = $this->createQuickMatch($owner);
        $match->setRelation('tournament', null);

        $this->assertTrue($owner->canScoreMatchInApp($match));
        $this->assertTrue($owner->canOperateQuickMatch($match));
        $this->assertTrue($owner->canOperateMatchInApp($match));
    }

    public function test_unrelated_user_cannot_score_quick_match(): void
    {
        $owner = User::factory()->create(['type' => 'user', 'status' => 'active']);
        $stranger = User::factory()->create(['type' => 'user', 'status' => 'active']);
        $match = $this->createQuickMatch($owner);
        $match->setRelation('tournament', null);

        $this->assertFalse($stranger->canScoreMatchInApp($match));
    }

    public function test_admin_can_score_quick_match(): void
    {
        $owner = User::factory()->create(['type' => 'user', 'status' => 'active']);
        $admin = User::factory()->create(['type' => 'administrator', 'status' => 'active']);
        $match = $this->createQuickMatch($owner);
        $match->setRelation('tournament', null);

        $this->assertTrue($admin->canScoreMatchInApp($match));
    }

    public function test_system_user_cannot_score_quick_match(): void
    {
        $owner = User::factory()->create(['type' => 'user', 'status' => 'active']);
        $system = User::factory()->create(['type' => 'system', 'status' => 'active']);
        $match = $this->createQuickMatch($owner);

        $this->assertFalse($system->canScoreMatchInApp($match));
    }

    public function test_tournament_organizer_can_still_score_tournament_match(): void
    {
        $this->setUpScoringMatch();

        $this->assertTrue($this->organizer->canScoreMatchInApp($this->scoringMatch));
        $this->assertTrue($this->organizer->canOperateTournamentInApp($this->scoringMatch->tournament));
    }

    public function test_quick_owner_cannot_operate_unrelated_tournament(): void
    {
        $this->setUpScoringMatch();
        $owner = User::factory()->create(['type' => 'user', 'status' => 'active']);
        $this->createQuickMatch($owner);

        $this->assertFalse($owner->canOperateTournamentInApp($this->scoringMatch->tournament));
        $this->assertFalse($owner->canScoreMatchInApp($this->scoringMatch));
    }
}
