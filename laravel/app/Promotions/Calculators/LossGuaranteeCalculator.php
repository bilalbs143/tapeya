<?php

namespace App\Promotions\Calculators;

use App\Enums\Promotion\PromotionPayoutTypeEnum;
use App\Enums\Promotion\PromotionProgressStateEnum;
use App\Enums\Transaction\MoneyTypeEnum;
use App\Enums\Transaction\TransactionTypeEnum;
use App\Models\Promotion;
use App\Models\PromotionProgress;
use App\Models\Transaction;
use App\Models\User;
use App\Promotions\Dto\BetEvent;
use App\Promotions\Dto\EligibilityResult;
use App\Promotions\Dto\PayoutResult;
use App\Promotions\Dto\ProgressUpdateResult;

class LossGuaranteeCalculator extends BasePromotionCalculator
{
    public function validateAdminInput(array $data): void
    {
        validator($data, [
            'min_deposit' => ['required', 'numeric', 'min:0'],
            'max_guarantee' => ['required', 'numeric', 'min:0'],
            'claim_to_multiplier' => ['required', 'numeric', 'min:1'],
            'withdraw_multiplier' => ['required', 'numeric', 'min:1'],
            'max_withdrawable' => ['required', 'numeric', 'min:0'],
        ])->validate();
    }

    public function activationRequirements(User $user, Promotion $promotion): EligibilityResult
    {
        $this->requireConfig($promotion, ['min_deposit', 'max_guarantee', 'claim_to_multiplier', 'withdraw_multiplier', 'max_withdrawable']);

        $minDeposit = (float) $this->cfg($promotion, 'min_deposit', 0);
        $depositTransaction = $this->getQualifyingDeposit($user, $minDeposit);

        if (! $depositTransaction) {
            return new EligibilityResult(
                false,
                __('messages.promotion_no_qualifying_deposit', ['min' => number_format($minDeposit, 0)])
            );
        }

        $depositAmount = (float) $depositTransaction->money;

        // Note: Query already filters for deposits >= minDeposit, so this check is for safety
        if ($depositAmount < $minDeposit) {
            return new EligibilityResult(
                false,
                __('messages.promotion_deposit_below_minimum', ['min' => number_format($minDeposit, 0), 'actual' => number_format($depositAmount, 0)])
            );
        }

        return new EligibilityResult(
            true,
            null,
            ['deposit' => $depositAmount]
        );
    }

    public function updateProgress(User $user, Promotion $promotion, PromotionProgress $progress, BetEvent $event): ProgressUpdateResult
    {
        if ($event->product !== 'slots') {
            return new ProgressUpdateResult($progress->stateEnum(), $progress->turnover, $progress->net_win_loss, $progress->meta ?? []);
        }

        $meta = $progress->meta ?? [];

        // Deposit must be stored in meta during activation
        if (! isset($meta['deposit']) || $meta['deposit'] <= 0) {
            // If deposit is missing, this is a data integrity issue
            // Return current state without updating to prevent incorrect calculations
            return new ProgressUpdateResult($progress->stateEnum(), $progress->turnover, $progress->net_win_loss, $meta);
        }

        $deposit = (float) $meta['deposit'];

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

        $claimToMultiplier = (float) $this->cfg($promotion, 'claim_to_multiplier', 2);
        $requiredToClaim = $deposit * $claimToMultiplier;

        $state = $progress->stateEnum();
        if ($requiredToClaim > 0 && $turnover >= $requiredToClaim) {
            $state = PromotionProgressStateEnum::COMPLETED;
        } elseif ($state === PromotionProgressStateEnum::ELIGIBLE) {
            $state = PromotionProgressStateEnum::ACTIVATED;
        }

        $meta['deposit'] = $deposit;
        $meta['required_to_claim'] = $requiredToClaim;

        return new ProgressUpdateResult($state, $turnover, $net, $meta);
    }

    public function canRedeem(User $user, Promotion $promotion, PromotionProgress $progress): bool
    {
        $meta = $progress->meta ?? [];
        $requiredToClaim = $meta['required_to_claim'] ?? 0;

        return $progress->stateEnum() === PromotionProgressStateEnum::COMPLETED
            && $requiredToClaim > 0
            && ($progress->turnover ?? 0) >= $requiredToClaim;
    }

    public function computePayout(User $user, Promotion $promotion, PromotionProgress $progress): PayoutResult
    {
        $meta = $progress->meta ?? [];
        $deposit = $meta['deposit'] ?? 0;
        $maxGuarantee = (float) $this->cfg($promotion, 'max_guarantee', 0);
        $withdrawMultiplier = (float) $this->cfg($promotion, 'withdraw_multiplier', 4);
        $maxWithdrawable = (float) $this->cfg($promotion, 'max_withdrawable', 0);

        $loss = max(($progress->net_win_loss ?? 0) * -1, 0);
        $guarantee = min($loss, $maxGuarantee);
        $withdrawGate = ($deposit + $guarantee) * $withdrawMultiplier;

        if ($maxWithdrawable > 0) {
            $withdrawGate = min($withdrawGate, $maxWithdrawable);
        }

        // Round guarantee to integer (points must be whole numbers)
        $guarantee = (int) round($guarantee);

        return new PayoutResult(
            PromotionPayoutTypeEnum::LOSS_GUARANTEE,
            $guarantee,
            meta: [
                'loss' => $loss,
                'withdraw_gate' => $withdrawGate,
                'max_withdrawable' => $maxWithdrawable,
            ]
        );
    }

    /**
     * Get the user's most recent qualifying deposit transaction.
     *
     * @param  float  $minDeposit  Minimum deposit amount required
     */
    private function getQualifyingDeposit(User $user, float $minDeposit): ?Transaction
    {
        return Transaction::query()
            ->where('user_id', $user->id)
            ->where('type', TransactionTypeEnum::DEPOSIT)
            ->where('sub_type', MoneyTypeEnum::MONEY)
            ->where('money', '>=', $minDeposit)
            ->whereNull('canceled_at')
            ->whereNull('refunded_at')
            ->orderBy('created_at', 'desc')
            ->first();
    }
}
