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

class PokerRakebackCalculator extends BasePromotionCalculator
{
    public function validateAdminInput(array $data): void
    {
        validator($data, [
            'rakeback_percentage' => ['required', 'numeric', 'min:0'],
            'min_payout' => ['nullable', 'numeric', 'min:0'],
        ])->validate();
    }

    public function activationRequirements(User $user, Promotion $promotion): EligibilityResult
    {
        $this->requireConfig($promotion, ['rakeback_percentage']);

        return new EligibilityResult(true);
    }

    public function updateProgress(User $user, Promotion $promotion, PromotionProgress $progress, BetEvent $event): ProgressUpdateResult
    {
        if ($event->product !== 'poker') {
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
        // Weekly promotions like POKER_RAKEBACK are automatically paid out on Tuesday
        // Manual redemption is disabled - users should wait for automatic weekly payout
        return false;
    }

    public function computePayout(User $user, Promotion $promotion, PromotionProgress $progress): PayoutResult
    {
        $rate = (float) $this->cfg($promotion, 'rakeback_percentage', 0);
        $minPayout = (float) $this->cfg($promotion, 'min_payout', 0);

        $rakeback = ($progress->turnover ?? 0) * $rate;
        if ($rakeback < $minPayout) {
            $rakeback = 0;
        }

        return new PayoutResult(
            PromotionPayoutTypeEnum::RAKEBACK,
            $rakeback,
            meta: ['min_payout' => $minPayout]
        );
    }
}
