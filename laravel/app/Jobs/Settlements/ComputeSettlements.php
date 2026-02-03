<?php

namespace App\Jobs\Settlements;

use App\Models\Settlements\DailyCumulativeSettlement;
use App\Models\Settlements\DailySettlement;
use App\Models\Settlements\MonthlyCumulativeSettlement;
use App\Utils\Services\Utils;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class ComputeSettlements implements ShouldQueue
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
        DB::transaction(function () {
            $this->computeDailySettlements();
        });
        sleep(10);
        DB::transaction(function () {
            $settlement = $this->computeCumulativeDailySettlements();
            $this->computeCumulativeMonthlySettlements($settlement);
        });
    }

    private function computeDailySettlements()
    {
        return DailySettlement::updateOrCreate([
            'date' => Utils::yesterday(),
        ], $this->getDailySettlementsArray());
    }

    private function computeCumulativeDailySettlements()
    {
        return DailyCumulativeSettlement::updateOrCreate([
            'date' => Utils::yesterday(),
        ], $this->getCumulativeDailySettlementsArray());
    }

    private function computeCumulativeMonthlySettlements(DailyCumulativeSettlement $settlement)
    {
        return MonthlyCumulativeSettlement::updateOrCreate([
            'month' => $settlement->date->format('m'),
            'year' => $settlement->date->format('Y'),
        ], $this->getMonthlySettlementArray($settlement));
    }
}
