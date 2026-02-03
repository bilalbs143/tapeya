<?php

namespace App\Http\Controllers\v1\Admin;

use App\Http\Resources\v1\Game\GameResource;
use App\Models\Game;

class GameController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(Game::class, GameResource::class, 'game');
    }

    protected function baseQuery()
    {
        return $this->model->with([
            'provider',
            'company',
        ]);
    }

    public function show(Game $game)
    {
        return $this->_show($game);
    }
}
