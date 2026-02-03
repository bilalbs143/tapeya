<?php

namespace App\Promotions\Contracts;

use App\Models\Promotion;
use App\Models\PromotionProgress;
use App\Models\User;
use App\Promotions\Dto\BetEvent;
use App\Promotions\Dto\EligibilityResult;
use App\Promotions\Dto\PayoutResult;
use App\Promotions\Dto\ProgressUpdateResult;

interface PromotionCalculatorInterface
{
    public function validateAdminInput(array $data): void;

    public function activationRequirements(User $user, Promotion $promotion): EligibilityResult;

    public function updateProgress(User $user, Promotion $promotion, PromotionProgress $progress, BetEvent $event): ProgressUpdateResult;

    public function canRedeem(User $user, Promotion $promotion, PromotionProgress $progress): bool;

    public function computePayout(User $user, Promotion $promotion, PromotionProgress $progress): PayoutResult;
}
