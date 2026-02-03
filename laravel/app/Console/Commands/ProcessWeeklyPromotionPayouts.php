<?php

namespace App\Console\Commands;

use App\Enums\Common\StatusEnum;
use App\Enums\Promotion\PromotionProgressStateEnum;
use App\Enums\Promotion\PromotionTypeEnum;
use App\Enums\Transaction\MoneyTypeEnum;
use App\Enums\Transaction\TransactionCategoryEnum;
use App\Enums\Transaction\TransactionSourceEnum;
use App\Enums\Transaction\TransactionTypeEnum;
use App\Models\Promotion;
use App\Models\PromotionProgress;
use App\Models\Transaction;
use App\Promotions\PromotionCalculatorFactory;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ProcessWeeklyPromotionPayouts extends Command
{
    protected $signature = 'promotions:process-weekly-payouts 
                            {--day=tuesday : Day of week for payout (monday, tuesday, etc.)}';

    protected $description = 'Process weekly promotion payouts for specified day (Tuesday for sabung cashback and poker rakeback)';

    private const CHUNK_SIZE = 100;

    // Promotion types that pay out on Tuesday according to documentation
    private const TUESDAY_PAYOUT_TYPES = [
        PromotionTypeEnum::SABUNG_CASHBACK,
        PromotionTypeEnum::POKER_RAKEBACK,
    ];

    public function __construct(
        private readonly PromotionCalculatorFactory $factory
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $day = strtolower($this->option('day'));

        // Determine which promotion types to process based on payout day
        $typesToProcess = match ($day) {
            'tuesday', 'tue' => self::TUESDAY_PAYOUT_TYPES,
            // Add more days/types as needed
            default => self::TUESDAY_PAYOUT_TYPES, // Default to Tuesday for now
        };

        $this->info("Processing weekly payouts for {$day}...");
        $this->line('Promotion types: '.implode(', ', array_map(fn ($type) => $type->value, $typesToProcess)));

        $stats = ['processed' => 0, 'payouts' => 0, 'total' => 0.0, 'errors' => 0];

        DB::transaction(function () use ($typesToProcess, &$stats) {
            $this->processPromotions($typesToProcess, $stats);
        });

        $this->newLine();
        $this->info("✓ Completed: {$stats['processed']} users processed, {$stats['payouts']} payouts distributed");
        $this->info('  Total payout amount: '.number_format($stats['total'], 2));

        if ($stats['errors'] > 0) {
            $this->warn("  Errors encountered: {$stats['errors']}");
        }

        return Command::SUCCESS;
    }

    private function processPromotions(array $typesToProcess, array &$stats): void
    {
        // Get all active promotions of the specified types
        $promotions = Promotion::whereIn('type', array_map(fn ($type) => $type->value, $typesToProcess))
            ->where('status', StatusEnum::ACTIVE->value)
            ->where(function ($query) {
                $now = now();
                $query->whereNull('valid_from')
                    ->orWhere('valid_from', '<=', $now);
            })
            ->where(function ($query) {
                $now = now();
                $query->whereNull('valid_to')
                    ->orWhere('valid_to', '>=', $now);
            })
            ->get();

        if ($promotions->isEmpty()) {
            $this->warn('No active promotions found for processing.');
            return;
        }

        $this->line("Found {$promotions->count()} active promotion(s)");

        foreach ($promotions as $promotion) {
            $this->line("Processing: {$promotion->name} ({$promotion->type})");
            $this->processPromotion($promotion, $stats);
        }
    }

    private function processPromotion(Promotion $promotion, array &$stats): void
    {
        // Find all users with activated progress for this promotion
        // For weekly payouts, we process all activated/eligible progresses
        $progresses = PromotionProgress::with(['promotion', 'user'])
            ->where('promotion_id', $promotion->id)
            ->whereIn('state', [
                PromotionProgressStateEnum::ACTIVATED->value,
                PromotionProgressStateEnum::ELIGIBLE->value,
            ])
            ->get();

        if ($progresses->isEmpty()) {
            $this->line("  No active progress found for promotion: {$promotion->name}");
            return;
        }

        $this->line("  Found {$progresses->count()} user progress(es) to process");

        $progresses->chunk(self::CHUNK_SIZE)->each(function (Collection $chunk) use ($promotion, &$stats) {
            foreach ($chunk as $progress) {
                $stats['processed']++;

                try {
                    $calculator = $this->factory->forType($promotion->typeEnum());

                    // Check if user can redeem
                    if (! $calculator->canRedeem($progress->user, $promotion, $progress)) {
                        continue;
                    }

                    // Compute payout
                    $payoutResult = $calculator->computePayout($progress->user, $promotion, $progress);

                    // Only process if payout amount > 0
                    if ($payoutResult->amount <= 0) {
                        continue;
                    }

                    // For weekly promotions, credit the payout and reset progress for next week
                    // (don't mark as COMPLETED so tracking continues)
                    DB::transaction(function () use ($progress, $promotion, $payoutResult) {
                        // Credit the payout
                        Transaction::createTransaction(
                            type: TransactionTypeEnum::POINTS_CREDITED,
                            amount: $payoutResult->amount,
                            moneyType: MoneyTypeEnum::POINTS,
                            user: $progress->user,
                            source: TransactionSourceEnum::PROMOTION,
                            category: TransactionCategoryEnum::PROMOTION_POINTS,
                            memo: "{$promotion->name} (Weekly Payout)",
                            sourceTransactionId: $promotion->id,
                        );

                        // Reset progress for next week (keep state as ACTIVATED for ongoing tracking)
                        $progress->update([
                            'turnover' => 0,
                            'net_win_loss' => 0,
                            'state' => PromotionProgressStateEnum::ACTIVATED->value,
                            // Don't set completed_at - this is a weekly recurring payout
                        ]);
                    });

                    $stats['payouts']++;
                    $stats['total'] += $payoutResult->amount;

                    $this->line("    ✓ User {$progress->user_id}: ".number_format($payoutResult->amount, 2).' credited (progress reset for next week)');
                } catch (\Exception $e) {
                    $stats['errors']++;
                    $this->error("    ✗ User {$progress->user_id}: {$e->getMessage()}");
                }
            }
        });
    }
}