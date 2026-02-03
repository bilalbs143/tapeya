<?php

namespace App\Jobs\Settlements;

use App\Enums\User\UserTypeEnum;
use App\Models\Settlements\UserDailyCumulativeSettlement;
use App\Models\Settlements\UserDailySettlement;
use App\Models\Settlements\UserMonthlyCumulativeSettlement;
use App\Models\User;
use App\Utils\Services\Utils;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ComputeUserSettlements implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, Settlementable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        User::with('wallet')->where(function ($q) {
            $q->where('type', UserTypeEnum::AGENT);
            $q->orWhere('type', UserTypeEnum::USER);
        })->chunk(500, function (Collection $users) {
            foreach ($users as $user) {
                DB::transaction(function () use ($user) {
                    $this->compute($user);
                    sleep(1);
                    $settlement = $this->computeCumulativeDailySettlements($user);
                    sleep(1);
                    $this->computeCumulativeMonthlySettlements($settlement, $user);
                });
                sleep(2);
            }
        });
    }

    private function compute(User $user)
    {
        UserDailySettlement::updateOrCreate([
            'user_id' => $user->id,
            'date' => Utils::yesterday(),
        ], $this->getDailySettlementsArray($user));
    }

    private function computeCumulativeDailySettlements(User $user)
    {
        return UserDailyCumulativeSettlement::updateOrCreate([
            'user_id' => $user->id,
            'date' => Utils::yesterday(),
        ], $this->getCumulativeDailySettlementsArray($user));
    }

    private function computeCumulativeMonthlySettlements(UserDailyCumulativeSettlement $settlement, User $user)
    {
        return UserMonthlyCumulativeSettlement::updateOrCreate([
            'user_id' => $user->id,
            'month' => $settlement->date->format('m'),
            'year' => $settlement->date->format('Y'),
        ], $this->getMonthlySettlementArray($settlement, $user));
    }
}
