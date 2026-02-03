<?php

namespace App\Console\Commands;

use App\Enums\Transaction\MoneyTypeEnum;
use App\Enums\Transaction\TransactionCategoryEnum;
use App\Enums\Transaction\TransactionSourceEnum;
use App\Enums\Transaction\TransactionTypeEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\Transaction;
use App\Models\User;
use App\Utils\Services\SystemSettingsService;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ComputeWeeklyLossBonus extends Command
{
    protected $signature = 'app:compute-weekly-loss-bonus';

    protected $description = 'Compute and distribute weekly loss bonus to eligible users';

    private const CHUNK_SIZE = 100;

    public function handle(): int
    {
        $bonusPercentage = $this->getBonusPercentage();

        if ($bonusPercentage <= 0) {
            return Command::SUCCESS;
        }

        $this->info("Computing weekly loss bonus ({$bonusPercentage}%)...");

        $dateRange = $this->getLastWeekDateRange();
        $this->line("Period: {$dateRange['start']->format('Y-m-d')} to {$dateRange['end']->format('Y-m-d')}");

        $stats = ['processed' => 0, 'bonuses' => 0, 'total' => 0.0];

        DB::transaction(function () use ($bonusPercentage, $dateRange, &$stats) {
            $this->processEligibleUsers($bonusPercentage, $dateRange, $stats);
        });

        $this->newLine();
        $this->info("✓ Completed: {$stats['processed']} users processed, {$stats['bonuses']} bonuses distributed");
        $this->info('  Total bonus amount: '.number_format($stats['total'], 2));

        return Command::SUCCESS;
    }

    private function getBonusPercentage(): float
    {
        $percentage = SystemSettingsService::getWeeklyLossBonusPercentage();

        if ($percentage <= 0) {
            $this->warn('Weekly loss bonus percentage is not configured or is zero.');
        }

        return $percentage;
    }

    private function getLastWeekDateRange(): array
    {
        $start = now()->subWeek()->startOfDay();
        $end = now()->subWeek()->endOfDay()->addDays(6);

        return [
            'start' => $start,
            'end' => $end,
        ];
    }

    private function processEligibleUsers(float $bonusPercentage, array $dateRange, array &$stats): void
    {
        $query = User::with('wallet')
            ->where('type', UserTypeEnum::USER)
            ->where('is_weekly_loss_bonus_enabled', true);

        $query->chunk(self::CHUNK_SIZE, function (Collection $users) use ($bonusPercentage, $dateRange, &$stats) {
            foreach ($users as $user) {
                $stats['processed']++;

                try {
                    $bonusAmount = $this->calculateAndDistributeBonus($user, $bonusPercentage, $dateRange);

                    if ($bonusAmount > 0) {
                        $stats['bonuses']++;
                        $stats['total'] += $bonusAmount;
                    }
                } catch (\Exception $e) {
                    $this->error("User {$user->id}: {$e->getMessage()}");
                }
            }
        });
    }

    private function calculateAndDistributeBonus(User $user, float $bonusPercentage, array $dateRange): float
    {
        $totalLosses = $this->calculateTotalLosses($user, $dateRange);

        if ($totalLosses <= 0) {
            return 0;
        }

        $bonusAmount = round($totalLosses * ($bonusPercentage / 100), 2);

        if ($bonusAmount <= 0) {
            return 0;
        }

        $this->createBonusTransaction($user, $bonusAmount, $bonusPercentage, $totalLosses);

        return $bonusAmount;
    }

    private function calculateTotalLosses(User $user, array $dateRange): float
    {
        $baseQuery = fn ($scope) => Transaction::whereBelongsTo($user)
            ->$scope()
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->sum('money');

        $bets = $baseQuery('bet');
        $wins = $baseQuery('win');
        $refunds = $baseQuery('refund');
        $cancels = $baseQuery('cancel');

        $netLoss = $bets - $wins - $refunds + $cancels;

        return max(0, $netLoss);
    }

    private function createBonusTransaction(
        User $user,
        float $bonusAmount,
        float $bonusPercentage,
        float $totalLosses
    ): void {
        // Transaction will be created with current timestamp (Monday 00:03)
        // It will be included in the next day's settlement (Tuesday's settlement for Monday)
        Transaction::createTransaction(
            type: TransactionTypeEnum::POINTS_CREDITED,
            amount: $bonusAmount,
            moneyType: MoneyTypeEnum::POINTS,
            user: $user,
            source: TransactionSourceEnum::BET,
            category: TransactionCategoryEnum::WEEKLY_LOSS_BONUS,
            memo: "Weekly loss bonus ({$bonusPercentage}% of ".number_format($totalLosses, 2).' losses)',
        );
    }
}
