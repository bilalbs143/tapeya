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
use Illuminate\Support\Arr;

class CasinoStreakCalculator extends BasePromotionCalculator
{
    public function validateAdminInput(array $data): void
    {
        validator($data, [
            'streak_length' => ['required', 'integer', 'min:2'],
            'bonus_percentage' => ['required', 'numeric', 'min:0'],
            'stake_min' => ['required', 'numeric', 'min:0'],
            'stake_max' => ['nullable', 'numeric', 'min:0'],
            'day_window' => ['nullable', 'string'],
        ])->validate();
    }

    public function activationRequirements(User $user, Promotion $promotion): EligibilityResult
    {
        $this->requireConfig($promotion, ['streak_length', 'bonus_percentage', 'stake_min']);

        return new EligibilityResult(true);
    }

    public function updateProgress(User $user, Promotion $promotion, PromotionProgress $progress, BetEvent $event): ProgressUpdateResult
    {
        if ($event->product !== 'baccarat') {
            return new ProgressUpdateResult($progress->stateEnum(), $progress->turnover, $progress->net_win_loss, $progress->meta ?? []);
        }

        $stakeMin = (float) $this->cfg($promotion, 'stake_min', 0);
        $stakeMax = (float) $this->cfg($promotion, 'stake_max', 0);

        if ($event->stake < $stakeMin) {
            return new ProgressUpdateResult($progress->stateEnum(), $progress->turnover, $progress->net_win_loss, $progress->meta ?? []);
        }

        if ($stakeMax > 0 && $event->stake > $stakeMax) {
            return new ProgressUpdateResult($progress->stateEnum(), $progress->turnover, $progress->net_win_loss, $progress->meta ?? []);
        }

        $result = strtolower($event->result ?? '');
        if (! in_array($result, ['win', 'lose'], true)) {
            return new ProgressUpdateResult($progress->stateEnum(), $progress->turnover, $progress->net_win_loss, $progress->meta ?? []);
        }

        $streakLength = (int) $this->cfg($promotion, 'streak_length', 8);
        $bonusPercentage = (float) $this->cfg($promotion, 'bonus_percentage', 0.25);

        $meta = $progress->meta ?? [];
        $currentResult = $meta['current_result'] ?? $result;
        $tickets = $meta['tickets'] ?? [];

        if ($currentResult !== $result) {
            $tickets = [];
            $currentResult = $result;
        }

        $tickets[] = [
            'ticket_id' => $event->ticketId,
            'stake' => $event->stake,
            'result' => $result,
        ];

        // Keep only latest streakLength items
        $tickets = array_slice($tickets, -1 * $streakLength);

        $turnover = ($progress->turnover ?? 0) + $event->stake;
        $net = ($progress->net_win_loss ?? 0) + $event->netWinLoss();

        $state = $progress->stateEnum();
        $bonus = 0;

        if (count($tickets) >= $streakLength && $this->isUniformResult($tickets, $result)) {
            $totalStake = array_sum(Arr::pluck($tickets, 'stake'));
            $bonus = $totalStake * $bonusPercentage;
            $state = PromotionProgressStateEnum::COMPLETED;
        } elseif ($state === PromotionProgressStateEnum::ELIGIBLE) {
            $state = PromotionProgressStateEnum::ACTIVATED;
        }

        $meta['current_result'] = $currentResult;
        $meta['tickets'] = $tickets;
        $meta['bonus'] = $bonus;

        return new ProgressUpdateResult($state, $turnover, $net, $meta);
    }

    public function canRedeem(User $user, Promotion $promotion, PromotionProgress $progress): bool
    {
        return $progress->stateEnum() === PromotionProgressStateEnum::COMPLETED
            && (($progress->meta['bonus'] ?? 0) > 0);
    }

    public function computePayout(User $user, Promotion $promotion, PromotionProgress $progress): PayoutResult
    {
        $bonus = $progress->meta['bonus'] ?? 0;

        return new PayoutResult(
            PromotionPayoutTypeEnum::BONUS,
            $bonus,
            meta: ['tickets' => $progress->meta['tickets'] ?? []]
        );
    }

    private function isUniformResult(array $tickets, string $result): bool
    {
        foreach ($tickets as $ticket) {
            if (($ticket['result'] ?? '') !== $result) {
                return false;
            }
        }

        return true;
    }
}
