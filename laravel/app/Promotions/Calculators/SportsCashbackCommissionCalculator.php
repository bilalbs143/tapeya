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

class SportsCashbackCommissionCalculator extends BasePromotionCalculator
{
    public function validateAdminInput(array $data): void
    {
        validator($data, [
            'cashback_rate' => ['required', 'numeric', 'min:0'],
            'commission_rate' => ['required', 'numeric', 'min:0'],
            'min_payout' => ['nullable', 'numeric', 'min:0'],
            'odds_thresholds.dec' => ['required', 'numeric'],
        ])->validate();
    }

    public function activationRequirements(User $user, Promotion $promotion): EligibilityResult
    {
        $this->requireConfig($promotion, ['cashback_rate', 'commission_rate', 'odds_thresholds']);

        return new EligibilityResult(true);
    }

    public function updateProgress(User $user, Promotion $promotion, PromotionProgress $progress, BetEvent $event): ProgressUpdateResult
    {
        if ($event->product !== 'sportsbook') {
            return new ProgressUpdateResult($progress->stateEnum(), $progress->turnover, $progress->net_win_loss, $progress->meta ?? []);
        }

        $oddsThreshold = (float) ($this->cfg($promotion, 'odds_thresholds.dec') ?? 0);
        if ($oddsThreshold > 0 && ($event->odds ?? 0) < $oddsThreshold) {
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
        $cashbackRate = (float) $this->cfg($promotion, 'cashback_percentage', 0);
        $commissionRate = (float) $this->cfg($promotion, 'commission_percentage', 0);
        $minPayout = (float) $this->cfg($promotion, 'min_payout', 0);

        $commission = ($progress->turnover ?? 0) * $commissionRate;
        $cashbackBase = max(($progress->net_win_loss ?? 0) * -1 - $commission, 0);
        $cashback = $cashbackBase * $cashbackRate;
        $total = $commission + $cashback;

        if ($total < $minPayout) {
            $total = 0;
            $cashback = 0;
            $commission = 0;
        }

        return new PayoutResult(
            PromotionPayoutTypeEnum::CASHBACK,
            $total,
            meta: [
                'commission' => $commission,
                'cashback' => $cashback,
                'min_payout' => $minPayout,
                'odds_threshold' => $this->cfg($promotion, 'odds_thresholds.dec'),
            ]
        );
    }
}
