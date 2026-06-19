<?php

namespace Tests\Unit\Services\Scoring;

use App\Enums\Event\DismissalTypeEnum;
use App\Enums\Event\MatchStatusEnum;
use App\Services\MatchCompletionService;
use Tests\Support\Scoring\BuildsScoringMatch;
use Tests\TestCase;

/**
 * Chase completed with wicket on same innings — target reached while losing a wicket.
 */
class MatchCompletionChaseEdgeCasesTest extends TestCase
{
    use BuildsScoringMatch;

    private MatchCompletionService $completion;

    protected function setUp(): void
    {
        parent::setUp();
        $this->completion = app(MatchCompletionService::class);
    }

    public function test_chase_completed_with_wicket_on_target_ball(): void
    {
        $this->setUpScoringMatch(overs: 1, playersPerSide: 11);

        $this->recordSequence($this->innings1, array_merge(
            [['runs' => 20, 'runs_off_bat' => 20]],
            array_fill(0, 5, ['runs' => 0, 'runs_off_bat' => 0]),
        ));
        $this->completion->evaluate($this->scoringMatch->fresh(['innings']));

        $this->recordSequence($this->innings2, [
            ['runs' => 19, 'runs_off_bat' => 19],
            [
                'runs' => 2,
                'runs_off_bat' => 2,
                'is_wicket' => true,
                'dismissal_type' => DismissalTypeEnum::BOWLED->value,
                'out_player_id' => $this->player(0)->id,
            ],
        ]);

        $this->completion->evaluate($this->scoringMatch->fresh(['innings']));

        $this->assertSame(MatchStatusEnum::COMPLETED, $this->scoringMatch->fresh()->status);
    }
}
