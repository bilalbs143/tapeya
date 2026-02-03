<?php

namespace App\Enums\SoundSettings;

use App\Enums\BaseEnumTrait;

enum SoundSettingsTypeEnum: string
{
    use BaseEnumTrait;

    case RECHARGE_REQUEST = 'recharge_request';
    case WITHDRAW_REQUEST = 'withdraw_request';
    case MEMBERSHIP_REQUEST = 'membership_request';
    case CUSTOMER_INQUIRY = 'customer_inquiry';
    case WITHDRAW_ROLLING_MONEY = 'withdraw_rolling_money';
    case WITHDRAW_LOSING_MONEY = 'withdraw_losing_money';
}
