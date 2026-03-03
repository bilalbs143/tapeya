<?php

namespace App\Enums\User;

use App\Enums\BaseEnumTrait;

enum BowlingStyleEnum: string
{
    use BaseEnumTrait;

    case RIGHT_ARM_FAST = 'right_arm_fast';
    case RIGHT_ARM_MEDIUM_FAST = 'right_arm_medium_fast';
    case RIGHT_ARM_MEDIUM = 'right_arm_medium';
    case RIGHT_ARM_OFF_BREAK = 'right_arm_off_break';
    case RIGHT_ARM_LEG_BREAK = 'right_arm_leg_break';
    case LEFT_ARM_FAST = 'left_arm_fast';
    case LEFT_ARM_MEDIUM_FAST = 'left_arm_medium_fast';
    case LEFT_ARM_ORTHODOX = 'left_arm_orthodox';
    case LEFT_ARM_WRIST_SPIN = 'left_arm_wrist_spin';

    public function label(): string
    {
        return match ($this) {
            self::RIGHT_ARM_FAST => 'Right Arm Fast',
            self::RIGHT_ARM_MEDIUM_FAST => 'Right Arm Medium Fast',
            self::RIGHT_ARM_MEDIUM => 'Right Arm Medium',
            self::RIGHT_ARM_OFF_BREAK => 'Right Arm Off Break',
            self::RIGHT_ARM_LEG_BREAK => 'Right Arm Leg Break',
            self::LEFT_ARM_FAST => 'Left Arm Fast',
            self::LEFT_ARM_MEDIUM_FAST => 'Left Arm Medium Fast',
            self::LEFT_ARM_ORTHODOX => 'Left Arm Orthodox',
            self::LEFT_ARM_WRIST_SPIN => 'Left Arm Wrist Spin',
        };
    }
}
