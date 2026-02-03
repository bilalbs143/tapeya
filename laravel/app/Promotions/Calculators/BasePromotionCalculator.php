<?php

namespace App\Promotions\Calculators;

use App\Models\Promotion;
use App\Models\PromotionProgress;
use App\Models\User;
use App\Promotions\Contracts\PromotionCalculatorInterface;
use App\Promotions\Dto\BetEvent;
use App\Promotions\Dto\EligibilityResult;
use App\Promotions\Dto\PayoutResult;
use App\Promotions\Dto\ProgressUpdateResult;
use Illuminate\Support\Arr;
use Illuminate\Validation\ValidationException;
use LogicException;

abstract class BasePromotionCalculator implements PromotionCalculatorInterface
{
    public function validateAdminInput(array $data): void
    {
        // Implement per type
    }

    public function activationRequirements(User $user, Promotion $promotion): EligibilityResult
    {
        throw new LogicException('activationRequirements not implemented for '.static::class);
    }

    public function updateProgress(User $user, Promotion $promotion, PromotionProgress $progress, BetEvent $event): ProgressUpdateResult
    {
        throw new LogicException('updateProgress not implemented for '.static::class);
    }

    public function canRedeem(User $user, Promotion $promotion, PromotionProgress $progress): bool
    {
        throw new LogicException('canRedeem not implemented for '.static::class);
    }

    public function computePayout(User $user, Promotion $promotion, PromotionProgress $progress): PayoutResult
    {
        throw new LogicException('computePayout not implemented for '.static::class);
    }

    protected function cfg(Promotion $promotion, string $key, mixed $default = null): mixed
    {
        return Arr::get($promotion->config ?? [], $key, $default);
    }

    protected function requireConfig(Promotion $promotion, array $keys): void
    {
        $missing = [];

        foreach ($keys as $key) {
            if (Arr::get($promotion->config ?? [], $key, null) === null) {
                $missing[] = $key;
            }
        }

        if ($missing) {
            throw ValidationException::withMessages([
                'config' => ['Missing promotion config keys: '.implode(', ', $missing)],
            ]);
        }
    }

    protected function numericRules(array $fields): array
    {
        $rules = [];
        foreach ($fields as $field => $min) {
            $rules[$field] = ['required', 'numeric', 'min:'.$min];
        }

        return $rules;
    }
}
