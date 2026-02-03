<?php

namespace App\Promotions\Services;

use App\Enums\Promotion\PromotionProgressStateEnum;
use App\Models\PromotionProgress;
use App\Promotions\Dto\BetEvent;
use App\Promotions\PromotionCalculatorFactory;
use Illuminate\Support\Facades\DB;

class PromotionTrackerService
{
    public function __construct(
        private readonly PromotionCalculatorFactory $factory
    ) {}

    public function handle(BetEvent $event): void
    {
        $progresses = PromotionProgress::with('promotion')
            ->where('user_id', $event->userId)
            ->whereNotIn('state', [
                PromotionProgressStateEnum::COMPLETED->value,
                PromotionProgressStateEnum::FORFEITED->value,
                PromotionProgressStateEnum::EXPIRED->value,
            ])
            ->get();

        foreach ($progresses as $progress) {
            $promotion = $progress->promotion;
            $calculator = $this->factory->forType($promotion->typeEnum());

            $result = $calculator->updateProgress($progress->user, $promotion, $progress, $event);

            DB::transaction(function () use ($progress, $result) {
                $progress->update([
                    'state' => $result->state->value,
                    'turnover' => $result->turnover,
                    'net_win_loss' => $result->netWinLoss,
                    'meta' => $result->meta,
                    'completed_at' => $result->state === PromotionProgressStateEnum::COMPLETED ? now() : $progress->completed_at,
                ]);
            });
        }
    }
}

