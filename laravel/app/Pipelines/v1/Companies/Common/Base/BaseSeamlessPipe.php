<?php

namespace App\Pipelines\v1\Companies\Common\Base;

use App\Facades\CompanyRequest;
use App\Models\Game;

abstract class BaseSeamlessPipe
{
    protected function findGame($gameId = null)
    {
        if ($gameId) {
            return Game::companyId(CompanyRequest::getCompanyId())->gameId($gameId)->first();
        }

        return null;
    }

    protected function findGameBySession()
    {
        return Game::companyId(CompanyRequest::getCompanyId())->findOrFail(CompanyRequest::getSession()?->game_id);
    }

    protected function afterGameFound(?Game $game = null)
    {
        if ($game) {
            CompanyRequest::setProvider($game->provider);
        }
    }
}
