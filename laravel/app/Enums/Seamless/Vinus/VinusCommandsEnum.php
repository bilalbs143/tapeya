<?php

namespace App\Enums\Seamless\Vinus;

use App\Enums\BaseEnumTrait;

enum VinusCommandsEnum: string
{
    use BaseEnumTrait;

    case AUTHENTICATE = 'authenticate';
    case BALANCE = 'balance';
    case BET = 'bet';
    case BET_WIN = 'bet-win';
    case WIN = 'win';
    case WIN_ADD = 'win-add';
    case BONUS = 'bonus';
    case BONUS_WIN = 'bonusWin';
    case JACKPOT_WIN = 'jackpotWin';
    case PROMO_WIN = 'promoWin';
    case CANCEL = 'cancel';
}
