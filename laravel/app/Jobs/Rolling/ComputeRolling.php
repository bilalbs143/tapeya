<?php

namespace App\Jobs\Rolling;

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

class ComputeRolling implements ShouldQueue
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
            $this->computeRolling();
        });
    }

    public function computeRolling()
    {
        $uniqueUserIds = $this->getUniqueUserIds();

        User::with('parent')->whereIn('id', $uniqueUserIds)
            ->chunk(100, function (Collection $users) {
                $this->distributeRollingAmounts($users);
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

    private function distributeRollingAmounts(Collection $users)
    {
        $users->each(function (User $user) {
            $parents = $user->getAllParentsFromParentToChild();
            $totalBetAmount = $this->getTotalBet($user);

            if ($totalBetAmount > 0) {
                $remainingAmount = $totalBetAmount;
                foreach ($parents as $parent) {
                    $rollingAmount = $remainingAmount * ($parent->rolling_ratio / 100);
                    $remainingAmount -= $rollingAmount;

                    $this->createRollingTransaction($parent, $rollingAmount, $user->id);
                }
            }
        });
    }

    private function getTotalBet(User $user): float
    {
        return $this->getTotalBetAmount($user) - $this->getTotalRefundedAmount($user);
    }

    private function getTotalBetAmount(User $user): float
    {
        return $this->baseQuery()->whereBelongsTo($user)->sum('money');
    }

    private function getTotalRefundedAmount(User $user): float
    {
        return $this->baseQuery(false)->refund()->whereBelongsTo($user)->sum('money');
    }

    private function createRollingTransaction(User $user, int|float $amount, int $givenBy)
    {
        if ($amount > 0) {
            Transaction::createTransaction(
                type: TransactionTypeEnum::ROLLING_MONEY_CREDITED,
                amount: $amount,
                moneyType: MoneyTypeEnum::ROLLING_MONEY,
                user: $user,
                source: TransactionSourceEnum::BET,
                category: TransactionCategoryEnum::ROLLING_MONEY_DISTRIBUTED,
                givenBy: $givenBy,
                createdAt: Utils::yesterday(),
            );
        }
    }
}
