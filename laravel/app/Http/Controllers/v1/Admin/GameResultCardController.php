<?php

namespace App\Http\Controllers\v1\Admin;

use App\Http\Resources\v1\GameResultCard\GameResultCardResource;
use App\Models\GameResultCard;

class GameResultCardController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(GameResultCard::class, GameResultCardResource::class);
    }

    protected function baseQuery()
    {
        return $this->model->with([
            'user',
            'company',
            'provider',
        ]);
    }

    public function show(GameResultCard $gameResultCard)
    {
        return $this->_show($gameResultCard);
    }
}
