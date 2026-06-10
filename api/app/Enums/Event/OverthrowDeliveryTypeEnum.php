<?php

namespace App\Enums\Event;

use App\Enums\BaseEnumTrait;

enum OverthrowDeliveryTypeEnum: string
{
    use BaseEnumTrait;

    case FAIR = 'fair';
    case WIDE = 'wide';
    case NO_BALL = 'no_ball';
    case BYE = 'bye';
    case LEG_BYE = 'leg_bye';

    public function label(): string
    {
        return match ($this) {
            self::FAIR => 'Fair Delivery',
            self::WIDE => 'Wide',
            self::NO_BALL => 'No Ball',
            self::BYE => 'Bye',
            self::LEG_BYE => 'Leg Bye',
        };
    }

    /** Valid on obstruct / retired dismissal delivery chips — not bye or leg bye. */
    public function validForDismissalDeliveryContext(): bool
    {
        return match ($this) {
            self::FAIR, self::WIDE, self::NO_BALL => true,
            default => false,
        };
    }
}
