<?php

namespace Tests\Unit\Enums;

use App\Enums\Broadcast\GraphicCommandDisplayModeEnum;
use App\Enums\Broadcast\GraphicCommandKeyEnum;
use App\Enums\Broadcast\GraphicCommandTypeEnum;
use App\Enums\Event\CricketFormatEnum;
use App\Enums\Event\DeclareResultTypeEnum;
use App\Enums\Event\DismissalTypeEnum;
use App\Enums\Event\ExtraTypeEnum;
use App\Enums\Event\InningsEndedByEnum;
use App\Enums\Event\InningsEndReasonEnum;
use App\Enums\Event\InningsStatusEnum;
use App\Enums\Event\MatchBreakTypeEnum;
use App\Enums\Event\MatchEndReasonEnum;
use App\Enums\Event\MatchOversEnum;
use App\Enums\Event\MatchStatusEnum;
use App\Enums\Event\MatchTimingEnum;
use App\Enums\Event\NoBallRunsTypeEnum;
use App\Enums\Event\NoBallTypeEnum;
use App\Enums\Event\OverthrowDeliveryTypeEnum;
use App\Enums\Event\PenaltyReasonEnum;
use App\Enums\Event\PenaltyTeamEnum;
use App\Enums\Event\PlayersPerSideEnum;
use App\Enums\Event\ShotPositionEnum;
use App\Enums\Event\TargetRevisionActionEnum;
use App\Enums\Event\TossChoiceEnum;
use PHPUnit\Framework\TestCase;

/**
 * Validates documented scorecard enum use cases (see docs/SCORECARD_ENUMS.md).
 * Asserts enum contracts and doc tables — not full scoring business logic.
 */
class ScorecardEnumUseCaseAuditTest extends TestCase
{
    public function test_dismissal_type_enum_doc_table_matches_implementation(): void
    {
        $wicketExpectations = [
            DismissalTypeEnum::BOWLED->value => true,
            DismissalTypeEnum::CAUGHT->value => true,
            DismissalTypeEnum::STUMPED->value => true,
            DismissalTypeEnum::LBW->value => true,
            DismissalTypeEnum::RUN_OUT->value => true,
            DismissalTypeEnum::MANKAD->value => true,
            DismissalTypeEnum::RETIRED->value => true,
            DismissalTypeEnum::RETIRED_HURT->value => false,
            DismissalTypeEnum::HIT_WICKET->value => true,
            DismissalTypeEnum::HIT_BALL_TWICE->value => true,
            DismissalTypeEnum::TIMED_OUT->value => true,
            DismissalTypeEnum::OBSTRUCTING_THE_FIELD->value => true,
        ];

        $bowlerCreditExpectations = [
            DismissalTypeEnum::BOWLED->value => true,
            DismissalTypeEnum::CAUGHT->value => true,
            DismissalTypeEnum::STUMPED->value => true,
            DismissalTypeEnum::LBW->value => true,
            DismissalTypeEnum::RUN_OUT->value => false,
            DismissalTypeEnum::MANKAD->value => false,
            DismissalTypeEnum::RETIRED->value => false,
            DismissalTypeEnum::RETIRED_HURT->value => false,
            DismissalTypeEnum::HIT_WICKET->value => true,
            DismissalTypeEnum::HIT_BALL_TWICE->value => false,
            DismissalTypeEnum::TIMED_OUT->value => false,
            DismissalTypeEnum::OBSTRUCTING_THE_FIELD->value => false,
        ];

        $fielderRequired = [
            DismissalTypeEnum::CAUGHT,
            DismissalTypeEnum::STUMPED,
            DismissalTypeEnum::RUN_OUT,
            DismissalTypeEnum::MANKAD,
        ];

        foreach (DismissalTypeEnum::cases() as $type) {
            $this->assertNotEmpty($type->label(), "{$type->value} must have label");
            $this->assertSame(
                $wicketExpectations[$type->value],
                $type->countsAsWicket(),
                "Wicket flag mismatch for {$type->value}",
            );
            $this->assertSame(
                $bowlerCreditExpectations[$type->value],
                $type->countsAsBowlerWicket(),
                "Bowler credit mismatch for {$type->value}",
            );
            $this->assertSame(
                in_array($type, $fielderRequired, true),
                $type->requiresFielder(),
                "Fielder requirement mismatch for {$type->value}",
            );
        }
    }

    public function test_dismissal_free_hit_wide_no_ball_rules_match_doc(): void
    {
        $freeHitValid = [
            DismissalTypeEnum::RUN_OUT,
            DismissalTypeEnum::OBSTRUCTING_THE_FIELD,
            DismissalTypeEnum::HIT_BALL_TWICE,
        ];
        $wideValid = [
            DismissalTypeEnum::RUN_OUT,
            DismissalTypeEnum::STUMPED,
            DismissalTypeEnum::OBSTRUCTING_THE_FIELD,
        ];
        $noBallValid = [
            DismissalTypeEnum::RUN_OUT,
            DismissalTypeEnum::OBSTRUCTING_THE_FIELD,
            DismissalTypeEnum::HIT_BALL_TWICE,
        ];

        foreach (DismissalTypeEnum::cases() as $type) {
            if ($type === DismissalTypeEnum::RETIRED_HURT) {
                continue;
            }

            $this->assertSame(
                in_array($type, $freeHitValid, true),
                $type->validOnFreeHit(),
                "Free-hit rule mismatch for {$type->value}",
            );
            $this->assertSame(
                in_array($type, $wideValid, true),
                $type->validOnWideDelivery(),
                "Wide rule mismatch for {$type->value}",
            );
            $this->assertSame(
                in_array($type, $noBallValid, true),
                $type->validOnNoBallDelivery(),
                "No-ball rule mismatch for {$type->value}",
            );
        }
    }

    public function test_extra_type_enum_ui_values(): void
    {
        $expected = ['wd', 'nb', 'bye', 'lb'];
        $this->assertSame($expected, ExtraTypeEnum::values());

        foreach (ExtraTypeEnum::cases() as $case) {
            $this->assertNotEmpty($case->label());
            $this->assertNotEmpty($case->shortLabel());
        }
    }

    public function test_no_ball_and_overthrow_enums_accept_all_cases(): void
    {
        foreach (NoBallTypeEnum::cases() as $case) {
            $this->assertNotEmpty($case->label());
        }
        $this->assertCount(4, NoBallTypeEnum::cases());

        foreach (NoBallRunsTypeEnum::cases() as $case) {
            $this->assertNotEmpty($case->label());
        }
        $this->assertCount(3, NoBallRunsTypeEnum::cases());

        $dismissalContextValid = [
            OverthrowDeliveryTypeEnum::FAIR,
            OverthrowDeliveryTypeEnum::WIDE,
            OverthrowDeliveryTypeEnum::NO_BALL,
        ];

        foreach (OverthrowDeliveryTypeEnum::cases() as $case) {
            $this->assertNotEmpty($case->label());
            $this->assertSame(
                in_array($case, $dismissalContextValid, true),
                $case->validForDismissalDeliveryContext(),
            );
        }
    }

    public function test_penalty_enums(): void
    {
        $this->assertSame(['batting', 'bowling'], PenaltyTeamEnum::values());

        $this->assertCount(12, PenaltyReasonEnum::cases());
        foreach (PenaltyReasonEnum::cases() as $case) {
            $this->assertNotEmpty($case->label());
        }
    }

    public function test_shot_position_enum(): void
    {
        $this->assertCount(8, ShotPositionEnum::cases());
        foreach (ShotPositionEnum::cases() as $case) {
            $this->assertNotEmpty($case->label());
        }
    }

    public function test_innings_status_enum(): void
    {
        $this->assertSame(
            ['not_started', 'in_progress', 'completed'],
            InningsStatusEnum::values(),
        );
        $this->assertFalse(InningsStatusEnum::NOT_STARTED->isCompleted());
        $this->assertTrue(InningsStatusEnum::IN_PROGRESS->isInProgress());
        $this->assertTrue(InningsStatusEnum::COMPLETED->isCompleted());
    }

    public function test_innings_end_reason_enum_match_state_mapping(): void
    {
        $expected = [
            InningsEndReasonEnum::ALL_OUT->value => 'all_out',
            InningsEndReasonEnum::OVERS_BOWLED->value => 'overs_complete',
            InningsEndReasonEnum::RUNS_CHASED->value => 'target_reached',
            InningsEndReasonEnum::TARGET_REVISION->value => 'target_reached',
            InningsEndReasonEnum::OUT_OF_TIME->value => 'manual',
            InningsEndReasonEnum::CAPTAIN->value => 'manual',
            InningsEndReasonEnum::REFEREE->value => 'manual',
            InningsEndReasonEnum::RAIN->value => 'manual',
        ];

        foreach (InningsEndReasonEnum::cases() as $reason) {
            $this->assertSame($expected[$reason->value], $reason->matchStateReason());
            $this->assertNotEmpty($reason->label());
        }

        $this->assertSame(
            InningsEndedByEnum::CAPTAIN,
            InningsEndReasonEnum::CAPTAIN->endedBy(),
        );
        $this->assertSame(
            InningsEndedByEnum::REFEREE,
            InningsEndReasonEnum::REFEREE->endedBy(),
        );
        $this->assertNull(InningsEndReasonEnum::ALL_OUT->endedBy());
    }

    public function test_innings_ended_by_enum(): void
    {
        $this->assertSame(
            ['system', 'captain', 'referee'],
            InningsEndedByEnum::values(),
        );
    }

    public function test_match_status_enum(): void
    {
        $this->assertSame(
            ['scheduled', 'toss_done', 'in_progress', 'completed', 'cancelled'],
            MatchStatusEnum::values(),
        );
    }

    public function test_match_end_and_break_enums(): void
    {
        $this->assertCount(6, MatchEndReasonEnum::cases());
        foreach (MatchEndReasonEnum::cases() as $case) {
            $this->assertNotEmpty($case->label());
        }

        $this->assertCount(12, MatchBreakTypeEnum::cases());
        foreach (MatchBreakTypeEnum::cases() as $case) {
            $this->assertNotEmpty($case->label());
        }
    }

    public function test_declare_result_and_target_revision_enums(): void
    {
        $this->assertSame(['award', 'draw'], DeclareResultTypeEnum::values());
        $this->assertSame(
            ['continue', 'end_innings'],
            TargetRevisionActionEnum::values(),
        );
    }

    public function test_match_setup_enums(): void
    {
        $this->assertSame(['bat', 'bowl'], TossChoiceEnum::values());
        $this->assertCount(4, CricketFormatEnum::cases());
        $this->assertCount(3, MatchTimingEnum::cases());
        $this->assertSame(
            [5, 10, 15, 20, 25, 30, 40, 50],
            MatchOversEnum::values(),
        );
        $this->assertSame(
            [2, 3, 4, 5, 11],
            PlayersPerSideEnum::values(),
        );

        foreach (TossChoiceEnum::cases() as $case) {
            $this->assertNotEmpty($case->label());
        }
    }

    public function test_graphic_command_enums(): void
    {
        $this->assertSame(
            ['LT', 'FS'],
            array_map(fn (GraphicCommandDisplayModeEnum $c) => $c->value, GraphicCommandDisplayModeEnum::cases()),
        );
        $this->assertCount(10, GraphicCommandTypeEnum::cases());

        $scoringFlashKeys = [
            GraphicCommandKeyEnum::LT_WIDE,
            GraphicCommandKeyEnum::LT_OUT,
            GraphicCommandKeyEnum::LT_NO_BALL,
            GraphicCommandKeyEnum::LT_FOUR,
            GraphicCommandKeyEnum::LT_SIX,
        ];

        foreach ($scoringFlashKeys as $key) {
            $this->assertSame(
                GraphicCommandTypeEnum::LOWER_THIRD,
                $key->commandType(),
            );
        }
    }
}
