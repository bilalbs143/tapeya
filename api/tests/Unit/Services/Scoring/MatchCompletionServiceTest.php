<?php

namespace Tests\Unit\Services\Scoring;

use App\Enums\Event\DismissalTypeEnum;
use App\Enums\Event\InningsStatusEnum;
use App\Enums\Event\MatchStatusEnum;
use App\Services\MatchCompletionService;
use Tests\Support\Scoring\BuildsScoringMatch;
use Tests\TestCase;

/**
 * Innings and match auto-completion — wickets, overs, chase target, ties.
 */
class MatchCompletionServiceTest extends TestCase
{
    use BuildsScoringMatch;

    private MatchCompletionService $completion;

    protected function setUp(): void
    {
        parent::setUp();
        $this->completion = app(MatchCompletionService::class);
    }

    /**
     * 3 players per side → 2 wickets ends innings (players_per_side - 1).
     */
    public function test_innings_completes_on_max_wickets(): void
    {
        $this->setUpScoringMatch(overs: 20, playersPerSide: 3);

        $this->recordSequence($this->innings1, [
            ['runs' => 0, 'runs_off_bat' => 0, 'is_wicket' => true, 'dismissal_type' => DismissalTypeEnum::BOWLED->value, 'out_player_id' => $this->player(0)->id],
            ['runs' => 0, 'runs_off_bat' => 0, 'is_wicket' => true, 'dismissal_type' => DismissalTypeEnum::BOWLED->value, 'out_player_id' => $this->player(2)->id],
        ]);

        $this->completion->evaluate($this->scoringMatch->fresh(['innings']));

        $this->assertSame(InningsStatusEnum::COMPLETED, $this->innings1->fresh()->status);
    }

    public function test_innings_completes_when_overs_exhausted(): void
    {
        $this->setUpScoringMatch(overs: 1, playersPerSide: 11);

        $dots = array_fill(0, 6, ['runs' => 0, 'runs_off_bat' => 0]);
        $this->recordSequence($this->innings1, $dots);

        $this->completion->evaluate($this->scoringMatch->fresh(['innings']));

        $this->assertSame(InningsStatusEnum::COMPLETED, $this->innings1->fresh()->status);
    }

    /**
     * Chase completes when runs reach target exactly (first innings + 1).
     */
    public function test_second_innings_completes_on_chase_target(): void
    {
        $this->setUpScoringMatch(overs: 1, playersPerSide: 11);

        // First innings: 50 runs in a complete over (6 legal balls)
        $this->recordSequence($this->innings1, array_merge(
            [['runs' => 50, 'runs_off_bat' => 50]],
            array_fill(0, 5, ['runs' => 0, 'runs_off_bat' => 0]),
        ));

        $this->completion->evaluate($this->scoringMatch->fresh(['innings']));
        $this->assertSame(InningsStatusEnum::COMPLETED, $this->innings1->fresh()->status);

        // Second innings chase: target 51
        $this->recordSequence($this->innings2, [
            ['runs' => 51, 'runs_off_bat' => 51],
        ]);

        $this->completion->evaluate($this->scoringMatch->fresh(['innings']));

        $this->assertSame(InningsStatusEnum::COMPLETED, $this->innings2->fresh()->status);
        $this->assertSame(MatchStatusEnum::COMPLETED, $this->scoringMatch->fresh()->status);
    }

    /**
     * Chase can complete on extras — e.g. wide pushing total over target.
     */
    public function test_chase_completed_on_wide_extras(): void
    {
        $this->setUpScoringMatch(overs: 1, playersPerSide: 11);

        $this->recordSequence($this->innings1, array_merge(
            [['runs' => 10, 'runs_off_bat' => 10]],
            array_fill(0, 5, ['runs' => 0, 'runs_off_bat' => 0]),
        ));
        $this->completion->evaluate($this->scoringMatch->fresh(['innings']));

        // Target 11 — score 10 then wide for 1
        $this->recordSequence($this->innings2, [
            ['runs' => 10, 'runs_off_bat' => 10],
            ['runs' => 1, 'runs_off_bat' => 0, 'is_wide' => true],
        ]);

        $this->completion->evaluate($this->scoringMatch->fresh(['innings']));

        $this->assertSame(InningsStatusEnum::COMPLETED, $this->innings2->fresh()->status);
    }

    /**
     * DLS revised target overrides first innings + 1.
     */
    public function test_dls_revised_target_used_for_chase(): void
    {
        $this->setUpScoringMatch(overs: 1, playersPerSide: 11);

        $this->recordSequence($this->innings1, array_merge(
            [['runs' => 200, 'runs_off_bat' => 200]],
            array_fill(0, 5, ['runs' => 0, 'runs_off_bat' => 0]),
        ));
        $this->completion->evaluate($this->scoringMatch->fresh(['innings']));

        $this->scoringMatch->update(['revised_target' => 85]);

        $this->recordSequence($this->innings2, [
            ['runs' => 85, 'runs_off_bat' => 85],
        ]);

        $this->completion->evaluate($this->scoringMatch->fresh(['innings']));

        $this->assertSame(InningsStatusEnum::COMPLETED, $this->innings2->fresh()->status);
    }

    public function test_match_winner_by_runs_when_first_innings_higher(): void
    {
        $this->setUpScoringMatch(overs: 1, playersPerSide: 11);

        $this->recordSequence($this->innings1, [
            ['runs' => 6, 'runs_off_bat' => 6],
            ['runs' => 6, 'runs_off_bat' => 6],
            ['runs' => 6, 'runs_off_bat' => 6],
            ['runs' => 6, 'runs_off_bat' => 6],
            ['runs' => 6, 'runs_off_bat' => 6],
            ['runs' => 0, 'runs_off_bat' => 0],
        ]);

        $this->recordSequence($this->innings2, [
            ['runs' => 4, 'runs_off_bat' => 4],
            ['runs' => 4, 'runs_off_bat' => 4],
            ['runs' => 4, 'runs_off_bat' => 4],
            ['runs' => 4, 'runs_off_bat' => 4],
            ['runs' => 4, 'runs_off_bat' => 4],
            ['runs' => 0, 'runs_off_bat' => 0],
        ]);

        $this->completion->evaluate($this->scoringMatch->fresh(['innings']));

        $match = $this->scoringMatch->fresh();
        $this->assertSame(MatchStatusEnum::COMPLETED, $match->status);
        $this->assertSame($this->innings1->batting_team_id, $match->winning_team_id);
        $this->assertSame(10, $match->win_by_runs);
    }

    public function test_match_winner_by_wickets_when_chase_successful(): void
    {
        $this->setUpScoringMatch(overs: 1, playersPerSide: 11);

        $this->recordSequence($this->innings1, array_merge(
            [['runs' => 50, 'runs_off_bat' => 50]],
            array_fill(0, 5, ['runs' => 0, 'runs_off_bat' => 0]),
        ));
        $this->completion->evaluate($this->scoringMatch->fresh(['innings']));

        $this->recordSequence($this->innings2, [['runs' => 51, 'runs_off_bat' => 51]]);

        $this->completion->evaluate($this->scoringMatch->fresh(['innings']));

        $match = $this->scoringMatch->fresh();
        $this->assertSame($this->innings2->batting_team_id, $match->winning_team_id);
        $this->assertSame(10, $match->win_by_wickets);
    }

    /**
     * Tie when both innings score the same — no winner.
     */
    public function test_tie_produces_no_winner(): void
    {
        $this->setUpScoringMatch(overs: 1, playersPerSide: 11);

        $inningsScore = [
            ['runs' => 4, 'runs_off_bat' => 4],
            ['runs' => 4, 'runs_off_bat' => 4],
            ['runs' => 4, 'runs_off_bat' => 4],
            ['runs' => 4, 'runs_off_bat' => 4],
            ['runs' => 4, 'runs_off_bat' => 4],
            ['runs' => 4, 'runs_off_bat' => 4],
        ];

        $this->recordSequence($this->innings1, $inningsScore);
        $this->recordSequence($this->innings2, $inningsScore);

        $this->completion->evaluate($this->scoringMatch->fresh(['innings']));

        $match = $this->scoringMatch->fresh();
        $this->assertSame(MatchStatusEnum::COMPLETED, $match->status);
        $this->assertNull($match->winning_team_id);
        $this->assertNull($match->win_by_runs);
        $this->assertNull($match->win_by_wickets);
    }

    /**
     * Retired hurt must not count toward all-out.
     */
    public function test_retired_hurt_does_not_complete_innings_on_wickets(): void
    {
        $this->setUpScoringMatch(overs: 20, playersPerSide: 3);

        $this->recordSequence($this->innings1, [
            ['runs' => 0, 'runs_off_bat' => 0, 'is_wicket' => true, 'dismissal_type' => DismissalTypeEnum::RETIRED_HURT->value, 'out_player_id' => $this->player(0)->id],
            ['runs' => 0, 'runs_off_bat' => 0, 'is_wicket' => true, 'dismissal_type' => DismissalTypeEnum::BOWLED->value, 'out_player_id' => $this->player(2)->id],
        ]);

        $this->completion->evaluate($this->scoringMatch->fresh(['innings']));

        // Only 1 real wicket — innings should stay in progress
        $this->assertSame(InningsStatusEnum::IN_PROGRESS, $this->innings1->fresh()->status);
    }

    /**
     * Deleting balls should revert completion (undo support).
     */
    public function test_completion_reverts_when_chase_ball_deleted(): void
    {
        $this->setUpScoringMatch(overs: 1, playersPerSide: 11);

        $this->recordSequence($this->innings1, array_merge(
            [['runs' => 10, 'runs_off_bat' => 10]],
            array_fill(0, 5, ['runs' => 0, 'runs_off_bat' => 0]),
        ));
        $this->completion->evaluate($this->scoringMatch->fresh(['innings']));

        $balls = $this->recordSequence($this->innings2, [
            ['runs' => 10, 'runs_off_bat' => 10],
            ['runs' => 1, 'runs_off_bat' => 1],
        ]);

        $this->completion->evaluate($this->scoringMatch->fresh(['innings']));
        $this->assertSame(MatchStatusEnum::COMPLETED, $this->scoringMatch->fresh()->status);

        $balls->last()->delete();
        $this->completion->evaluate($this->scoringMatch->fresh(['innings']));

        $this->assertSame(InningsStatusEnum::IN_PROGRESS, $this->innings2->fresh()->status);
        $this->assertSame(MatchStatusEnum::IN_PROGRESS, $this->scoringMatch->fresh()->status);
    }

    /**
     * Chase completion must use full InningsStatsService totals (includes additional_runs rows).
     */
    public function test_second_innings_completes_when_chase_met_via_additional_runs_only(): void
    {
        $this->setUpScoringMatch(overs: 1, playersPerSide: 11);

        $this->recordSequence($this->innings1, array_merge(
            [['runs' => 20, 'runs_off_bat' => 20]],
            array_fill(0, 5, ['runs' => 0, 'runs_off_bat' => 0]),
        ));
        $this->completion->evaluate($this->scoringMatch->fresh(['innings']));
        $this->assertSame(InningsStatusEnum::COMPLETED, $this->innings1->fresh()->status);

        // Target 21 — met by an additional-runs-only adjustment (not a legal delivery).
        $this->recordSequence($this->innings2, [
            ['runs' => 0, 'runs_off_bat' => 0, 'additional_runs' => 21],
        ]);

        $this->completion->evaluate($this->scoringMatch->fresh(['innings']));

        $this->assertSame(InningsStatusEnum::COMPLETED, $this->innings2->fresh()->status);
        $this->assertSame(MatchStatusEnum::COMPLETED, $this->scoringMatch->fresh()->status);
    }
}
