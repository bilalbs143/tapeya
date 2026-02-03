<?php

namespace App\Http\Controllers\v1\Admin\Settlements;

use App\Http\Controllers\v1\Admin\BaseAdminController;
use App\Http\Resources\v1\Settlements\MonthlyCumulativeSettlementResource;
use App\Models\Settlements\MonthlyCumulativeSettlement;
use App\Utils\Services\Utils;

class MonthlySettlementsController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(MonthlyCumulativeSettlement::class, MonthlyCumulativeSettlementResource::class);
    }

    protected function baseQuery()
    {
        return $this->model->query();
    }

    public function get()
    {
        if (request()->filled('agent_id') || Utils::isAgent()) {
            return app(UserMonthlyCumulativeSettlementsController::class)->index();
        }

        return $this->index();
    }
}
