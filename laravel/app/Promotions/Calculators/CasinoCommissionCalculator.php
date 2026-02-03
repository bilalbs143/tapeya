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

class CasinoCommissionCalculator extends BasePromotionCalculator
{
    public function validateAdminInput(array $data): void
    {
        validator($data, [
            'commission_percentage' => ['required', 'numeric', 'min:0'],
        ])->validate();
    }

    public function activationRequirements(User $user, Promotion $promotion): EligibilityResult
    {
        $this->requireConfig($promotion, ['commission_percentage']);

        return new EligibilityResult(true);
    }

    public function updateProgress(User $user, Promotion $promotion, PromotionProgress $progress, BetEvent $event): ProgressUpdateResult
    {
        if ($event->product !== 'casino') {
            return new ProgressUpdateResult($progress->stateEnum(), $progress->turnover, $progress->net_win_loss, $progress->meta ?? []);
        }

        // Track turnover on DEBIT (bet placement) - ensures ALL bets count, win or lose
        // Track net_win_loss on WIN (settled bets) - only when bet is settled
        $turnover = $progress->turnover ?? 0;
        $net = $progress->net_win_loss ?? 0;

        // If result is null, this is a DEBIT event (bet placement) - track turnover only
        if ($event->result === null) {
            $turnover += $event->stake;
        } else {
            // This is a WIN/REFUND/CANCEL event (settled bet)
            // Only update net_win_loss, don't add to turnover again (already counted on DEBIT)
            $net += $event->netWinLoss();
        }

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
        $rate = (float) $this->cfg($promotion, 'commission_percentage', 0);
        $bonus = ($progress->turnover ?? 0) * $rate;

        // Round bonus to integer (points must be whole numbers)
        $bonus = (int) round($bonus);

        return new PayoutResult(
            PromotionPayoutTypeEnum::COMMISSION,
            $bonus
        );
    }
}
