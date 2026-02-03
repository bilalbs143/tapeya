<?php

namespace App\Http\Controllers\v1\Admin;

use App\Http\Resources\v1\Promotion\PromotionProgressResource;
use App\Models\PromotionProgress;

class PromotionProgressController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(PromotionProgress::class, PromotionProgressResource::class, 'promotion_progress');
    }

    protected function baseQuery()
    {
        return $this->model->with(['promotion', 'user']);
    }

    public function show(PromotionProgress $promotionProgress)
    {
        return $this->_show($promotionProgress);
    }
}

