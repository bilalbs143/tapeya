<?php

namespace App\Enums\Faq;

use App\Enums\BaseEnumTrait;

enum FaqCategoryEnum: string
{
    use BaseEnumTrait;

    case SLOT_GAMES = 'slot_games';
    case LIVE_CASINO = 'live_casino';
    case PARTNER_INQUIRY = 'partner_inquiry';
    case MEMBER_INQUIRY = 'member_inquiry';
    case SETTLEMENT_INQUIRY = 'settlement_inquiry';
    case ACCOUNT_INQUIRY = 'account_inquiry';
    case OTHER_INQUIRIES = 'other_inquiries';
}
