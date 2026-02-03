<?php

namespace App\Promotions\Calculators;

use App\Enums\Promotion\PromotionPayoutTypeEnum;
use App\Enums\Promotion\PromotionProgressStateEnum;
use App\Models\Promotion;
use App\Models\PromotionProgress;
use App\Models\User;
use App\Promotions\Dto\BetEvent;
use App\Promotions\Dto\EligibilityResult;
use App\Promotions\Dto\PayoutResult;
use App\Promotions\Dto\ProgressUpdateResult;

class ArcadeCashbackCalculator extends BasePromotionCalculator
{
    public function validateAdminInput(array $data): void
    {
        validator($data, [
            'cashback_percentage' => ['required', 'numeric', 'min:0'],
            'min_payout' => ['required', 'numeric', 'min:0'],
            'max_payout' => ['required', 'numeric', 'min:0'],
        ])->validate();
    }

    public function activationRequirements(User $user, Promotion $promotion): EligibilityResult
    {
        $this->requireConfig($promotion, ['cashback_percentage', 'min_payout', 'max_payout']);

        return new EligibilityResult(true);
    }

    public function updateProgress(User $user, Promotion $promotion, PromotionProgress $progress, BetEvent $event): ProgressUpdateResult
    {
        if ($event->product !== 'arcade') {
            return new ProgressUpdateResult($progress->stateEnum(), $progress->turnover, $progress->net_win_loss, $progress->meta ?? []);
        }

        $turnover = ($progress->turnover ?? 0) + $event->stake;
        $net = ($progress->net_win_loss ?? 0) + $event->netWinLoss();
        $state = $progress->stateEnum();
        if ($state === PromotionProgressStateEnum::ELIGIBLE) {
            $state = PromotionProgressStateEnum::ACTIVATED;
        }

        return new ProgressUpdateResult($state, $turnover, $net, $progress->meta ?? []);
    }

    public function canRedeem(User $user, Promotion $promotion, PromotionProgress $progress): bool
    {
        return ($progress->turnover ?? 0) > 0;
    }

    public function computePayout(User $user, Promotion $promotion, PromotionProgress $progress): PayoutResult
    {
        $rate = (float) $this->cfg($promotion, 'cashback_percentage', 0);
        $min = (float) $this->cfg($promotion, 'min_payout', 0);
        $max = (float) $this->cfg($promotion, 'max_payout', 0);

        $cashback = ($progress->turnover ?? 0) * $rate;
        if ($cashback < $min) {
            $cashback = 0;
        }
        if ($max > 0) {
            $cashback = min($cashback, $max);
        }

        return new PayoutResult(
            PromotionPayoutTypeEnum::CASHBACK,
            $cashback,
            meta: ['min_payout' => $min, 'max_payout' => $max]
        );
    }
}
