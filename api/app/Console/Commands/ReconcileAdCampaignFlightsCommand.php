<?php

namespace App\Console\Commands;

use App\Services\Ad\AdCampaignFlightService;
use Illuminate\Console\Command;

class ReconcileAdCampaignFlightsCommand extends Command
{
    protected $signature = 'ads:reconcile-flights';

    protected $description = 'Activate scheduled ad campaigns and end flights past ends_at.';

    public function handle(AdCampaignFlightService $flights): int
    {
        $result = $flights->reconcile();
        $this->info("Activated {$result['activated']}; ended {$result['ended']}.");

        return self::SUCCESS;
    }
}
