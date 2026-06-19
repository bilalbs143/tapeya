<?php

namespace Tests\Unit\Services\Scoring;

use App\Enums\Event\DismissalTypeEnum;
use App\Services\MatchStateService;
use Tests\Support\Scoring\BuildsScoringMatch;
use Tests\TestCase;

/**
 * Regression: needs_new_bowler after over-end wicket must only suppress for bowler-credited dismissals.
 *
 * @see docs/SCORECARD_TEST_FINDINGS.md BUG-003
 */
class MatchStateServiceNeedsNewBowlerTest extends TestCase
{
    use BuildsScoringMatch;

    private MatchStateService $matchStateService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpScoringMatch();
        $this->matchStateService = app(MatchStateService::class);
    }

    public function test_run_out_on_sixth_legal_ball_prompts_new_bowler(): void
    {
        $this->recordSequence($this->innings1, [
            ...array_fill(0, 5, []),
            [
                'is_wicket' => true,
                'dismissal_type' => DismissalTypeEnum::RUN_OUT->value,
                'out_player_id' => $this->player(0)->id,
                'fielder_id' => $this->player(7)->id,
            ],
        ]);

        $state = $this->matchStateService->build($this->scoringMatch->fresh(), $this->innings1);

        $this->assertTrue($state['needs_new_bowler'], 'Run-out on over end should still prompt bowler change');
    }

    public function test_bowled_on_sixth_legal_ball_does_not_prompt_new_bowler(): void
    {
        $this->recordSequence($this->innings1, [
            ...array_fill(0, 5, []),
            [
                'is_wicket' => true,
                'dismissal_type' => DismissalTypeEnum::BOWLED->value,
                'out_player_id' => $this->player(0)->id,
            ],
        ]);

        $state = $this->matchStateService->build($this->scoringMatch->fresh(), $this->innings1);

        $this->assertFalse($state['needs_new_bowler'], 'Bowled on over end suppresses automatic bowler prompt');
    }

    public function test_retired_hurt_on_sixth_legal_ball_prompts_new_bowler(): void
    {
        $this->recordSequence($this->innings1, [
            ...array_fill(0, 5, []),
            [
                'is_wicket' => true,
                'dismissal_type' => DismissalTypeEnum::RETIRED_HURT->value,
                'out_player_id' => $this->player(0)->id,
            ],
        ]);

        $state = $this->matchStateService->build($this->scoringMatch->fresh(), $this->innings1);

        $this->assertTrue($state['needs_new_bowler'], 'Retired hurt is not bowler-credited; prompt should fire');
    }
}
