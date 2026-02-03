<?php

namespace App\Http\Controllers\v1\Admin\Settlements;

use App\Http\Controllers\v1\Admin\BaseAdminController;
use App\Http\Resources\v1\Settlements\DailySettlementResource;
use App\Models\Settlements\DailySettlement;
use App\Utils\Services\Utils;

class DailySettlementsController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(DailySettlement::class, DailySettlementResource::class);
    }

    protected function baseQuery()
    {
        return $this->model->query();
    }

    public function get()
    {
        if (request()->filled('agent_id') || Utils::isAgent()) {
            return app(UserDailySettlementsController::class)->index();
        }

        return $this->index();
    }
}
