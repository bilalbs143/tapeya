<?php

namespace App\Jobs\Losing;

use App\Enums\Transaction\MoneyTypeEnum;
use App\Enums\Transaction\TransactionCategoryEnum;
use App\Enums\Transaction\TransactionSourceEnum;
use App\Enums\Transaction\TransactionTypeEnum;
use App\Models\Transaction;
use App\Models\User;
use App\Utils\Services\Utils;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ComputeLosing implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 15;

    public $timeout = 300;

    public $failOnTimeout = true;

    /**
     * Create a new job instance.
     */
    public function __construct() {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        DB::transaction(function () {
            $this->computeLosing();
        });
    }

    public function computeLosing()
    {
        $uniqueUserIds = $this->getUniqueUserIds();

        User::with('parent')->whereIn('id', $uniqueUserIds)
            ->chunk(100, function (Collection $users) {
                $this->distributeLosingAmounts($users);
            });
    }

    private function baseQuery($bet = true)
    {
        return Transaction::when($bet, fn ($q) => $q->bet())->yesterday();
    }

    private function getUniqueUserIds()
    {
        return $this->baseQuery()->distinct()->pluck('user_id')->toArray();
    }

    private function calculateProfitOrLossSharingRatio($parents)
    {
        $prevParent = null;
        $profitSharing = [];
        foreach ($parents as $parent) {
            if ($prevParent) {
                $profitSharing[$parent->id] = $parent->losing_point_ratio - $prevParent->losing_point_ratio;
            } else {
                $profitSharing[$parent->id] = $parent->losing_point_ratio;
            }
            $prevParent = $parent;
        }

        return $profitSharing;
    }

    private function distributeLosingAmounts(Collection $users)
    {
        $users->each(function (User $user) {
            $parents = $user->getAllParents();
            $profitSharing = $this->calculateProfitOrLossSharingRatio($parents);
            $totalWinAmount = $this->getTotalWin($user);

            if ($totalWinAmount > 0) {
                foreach ($parents as $parent) {
                    $losingAmount = $totalWinAmount * ($profitSharing[$parent->id] / 100);
                    $this->createLossSharingTransaction($parent, $losingAmount, $user->id);
                }
            } elseif ($totalWinAmount < 0) {
                foreach ($parents as $parent) {
                    $losingAmount = abs($totalWinAmount) * ($profitSharing[$parent->id] / 100);
                    $this->createProfitSharingTransaction($parent, $losingAmount, $user->id);
                }
            }
        });
    }

    private function getTotalWin(User $user): float
    {
        $totalWinningAmount = $this->getTotalWinningAmount($user);
        $totalBetAmount = $this->getTotalBetAmount($user);
        $totalRefundedAmount = $this->getTotalRefundedAmount($user);
        $totalCancelledAmount = $this->getTotalCancelledAmount($user);

        $totalAmount = $totalWinningAmount - $totalBetAmount + $totalRefundedAmount - $totalCancelledAmount;

        return $totalAmount;
    }

    private function getTotalBetAmount(User $user): float
    {
        return $this->baseQuery()->whereBelongsTo($user)->sum('money');
    }

    private function getTotalRefundedAmount(User $user): float
    {
        return $this->baseQuery(false)->refund()->whereBelongsTo($user)->sum('money');
    }

    private function getTotalWinningAmount(User $user): float
    {
        return $this->baseQuery(false)->win()->whereBelongsTo($user)->sum('money');
    }

    private function getTotalCancelledAmount(User $user): float
    {
        return $this->baseQuery(false)->cancel()->whereBelongsTo($user)->sum('money');
    }

    private function createProfitSharingTransaction(User $user, int|float $amount, int $givenBy)
    {
        Transaction::createTransaction(
            type: TransactionTypeEnum::LOSING_MONEY_CREDITED,
            amount: $amount,
            moneyType: MoneyTypeEnum::LOSING_MONEY,
            user: $user,
            source: TransactionSourceEnum::BET,
            category: TransactionCategoryEnum::LOSING_MONEY_DISTRIBUTED,
            givenBy: $givenBy,
            createdAt: Utils::yesterday(),
        );
    }

    private function createLossSharingTransaction(User $user, int|float $amount, int $givenBy)
    {
        Transaction::createTransaction(
            type: TransactionTypeEnum::LOSING_MONEY_DEBITED,
            amount: $amount,
            moneyType: MoneyTypeEnum::LOSING_MONEY,
            user: $user,
            source: TransactionSourceEnum::BET,
            category: TransactionCategoryEnum::LOSING_MONEY_DEBITED,
            givenBy: $givenBy,
            createdAt: Utils::yesterday(),
        );
    }
}
