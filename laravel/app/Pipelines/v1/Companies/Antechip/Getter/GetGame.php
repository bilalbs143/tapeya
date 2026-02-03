<?php

namespace App\Pipelines\v1\Companies\Antechip\Getter;

use App\Facades\CompanyRequest;
use App\Http\Requests\Seamless\Antechip\BaseAntechipRequest;
use App\Models\Game;
use Closure;
use Illuminate\Support\Collection;

class GetGame
{
    /**
     * Handle the given input.
     *
     * @param  Collection  $collection
     * @return mixed
     */
    public function handle(BaseAntechipRequest $request, Closure $next)
    {
        if ($request->hasGameId()) {
            $game = Game::companyId(CompanyRequest::getCompanyId())->gameId($request->getGameId())->firstOrFail();
        } else {
            $game = Game::companyId(CompanyRequest::getCompanyId())->findOrFail(CompanyRequest::getSession()->game_id);
        }

        if ($game) {
            CompanyRequest::setProvider($game->provider);
        }

        return $next(collect(['game' => $game, 'request' => $request]));
    }
}
