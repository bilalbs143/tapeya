<?php

use App\Enums\Promotion\PromotionTypeEnum;
use App\Promotions\Calculators\ArcadeCashbackCalculator;
use App\Promotions\Calculators\CasinoCommissionCalculator;
use App\Promotions\Calculators\CasinoStreakCalculator;
use App\Promotions\Calculators\LossGuaranteeCalculator;
use App\Promotions\Calculators\PokerRakebackCalculator;
use App\Promotions\Calculators\SabungCashbackCalculator;
use App\Promotions\Calculators\SlotsCashbackCommissionCalculator;
use App\Promotions\Calculators\SlotsDepositBonusCalculator;
use App\Promotions\Calculators\SportsCashbackCommissionCalculator;

return [
    'calculators' => [
        PromotionTypeEnum::SLOTS_DEPOSIT->value => SlotsDepositBonusCalculator::class,
        PromotionTypeEnum::CASINO_STREAK->value => CasinoStreakCalculator::class,
        PromotionTypeEnum::SLOTS_CASHBACK_COMMISSION->value => SlotsCashbackCommissionCalculator::class,
        PromotionTypeEnum::SPORTS_CASHBACK_COMMISSION->value => SportsCashbackCommissionCalculator::class,
        PromotionTypeEnum::POKER_RAKEBACK->value => PokerRakebackCalculator::class,
        PromotionTypeEnum::ARCADE_CASHBACK->value => ArcadeCashbackCalculator::class,
        PromotionTypeEnum::CASINO_COMMISSION->value => CasinoCommissionCalculator::class,
        PromotionTypeEnum::LOSS_GUARANTEE->value => LossGuaranteeCalculator::class,
        PromotionTypeEnum::SABUNG_CASHBACK->value => SabungCashbackCalculator::class,
    ],
];
