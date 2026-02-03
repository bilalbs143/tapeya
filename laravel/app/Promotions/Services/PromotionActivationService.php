<?php

namespace App\Promotions\Services;

use App\Enums\Promotion\PromotionProgressStateEnum;
use App\Enums\Transaction\MoneyTypeEnum;
use App\Enums\Transaction\TransactionCategoryEnum;
use App\Enums\Transaction\TransactionSourceEnum;
use App\Enums\Transaction\TransactionTypeEnum;
use App\Models\Promotion;
use App\Models\PromotionProgress;
use App\Models\Transaction;
use App\Models\User;
use App\Promotions\PromotionCalculatorFactory;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PromotionActivationService
{
    public function __construct(
        private readonly PromotionCalculatorFactory $factory
    ) {}

    public function activate(Promotion $promotion, User $user): PromotionProgress
    {
        $calculator = $this->factory->forType($promotion->typeEnum());

        $eligibility = $calculator->activationRequirements($user, $promotion);
        if (! $eligibility->eligible) {
            throw ValidationException::withMessages([
                'promotion' => [$eligibility->reason ?? 'Not eligible for promotion'],
            ]);
        }

        return DB::transaction(function () use ($promotion, $user, $eligibility) {
            // Extract deposit amount from eligibility meta if available
            $depositAmount = $eligibility->meta['deposit'] ?? null;

            // Prepare meta data for progress
            $meta = [];
            if ($depositAmount !== null) {
                $meta['deposit'] = (float) $depositAmount;
            }

            // Get existing progress to merge meta if updating
            $existingProgress = PromotionProgress::where('promotion_id', $promotion->id)
                ->where('user_id', $user->id)
                ->first();

            if ($existingProgress && ! empty($existingProgress->meta)) {
                // Merge with existing meta, but preserve deposit if already set
                $existingMeta = $existingProgress->meta ?? [];
                $meta = array_merge($existingMeta, $meta);
            }

            /** @var PromotionProgress $progress */
            $progress = PromotionProgress::updateOrCreate(
                ['promotion_id' => $promotion->id, 'user_id' => $user->id],
                [
                    'state' => PromotionProgressStateEnum::ACTIVATED->value,
                    'activated_at' => now(),
                    'meta' => $meta,
                ]
            );

            return $progress->fresh();
        });
    }

    public function redeem(PromotionProgress $progress): PromotionProgress
    {
        $promotion = $progress->promotion;
        $user = $progress->user;
        $calculator = $this->factory->forType($promotion->typeEnum());

        if (! $calculator->canRedeem($user, $promotion, $progress)) {
            throw ValidationException::withMessages([
                'promotion' => [__('messages.promotion_not_ready_for_redemption')],
            ]);
        }

        $payoutResult = $calculator->computePayout($user, $promotion, $progress);

        return DB::transaction(function () use ($progress, $promotion, $user, $payoutResult) {
            // credit promotion points transaction instead of direct money
            Transaction::createTransaction(
                type: TransactionTypeEnum::POINTS_CREDITED,
                amount: $payoutResult->amount,
                moneyType: MoneyTypeEnum::POINTS,
                user: $user,
                source: TransactionSourceEnum::PROMOTION,
                category: TransactionCategoryEnum::PROMOTION_POINTS,
                memo: "{$promotion->name}",
                sourceTransactionId: $promotion->id,
            );

            $progress->update([
                'state' => PromotionProgressStateEnum::COMPLETED->value,
                'completed_at' => now(),
            ]);

            return $progress->fresh('promotion');
        });
    }
}
