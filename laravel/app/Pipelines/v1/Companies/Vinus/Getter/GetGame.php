<?php

namespace App\Pipelines\v1\Companies\Vinus\Getter;

use App\Enums\Seamless\Vinus\VinusStatusCode;
use App\Exceptions\Seamless\FailureException;
use App\Http\Requests\Seamless\Vinus\VinusRequest;
use App\Pipelines\v1\Companies\Common\Base\BaseSeamlessPipe;
use Closure;
use Illuminate\Support\Collection;

class GetGame extends BaseSeamlessPipe
{
    /**
     * Handle the given input.
     *
     * @param  Collection  $collection
     * @return mixed
     */
    public function handle(VinusRequest $request, Closure $next)
    {
        $gameId = $request->getData('game');
        $gameID = $request->getData('game_id');
        $game = null;

        if ($gameId || $gameID) {
            $game = $this->findGame($gameId);
            if (! $game) {
                $game = $this->findGame($gameID);
            }
            throw_unless($game, new FailureException(__('vinus.game_not_found'), customCode: VinusStatusCode::VALIDATION_ERRORS));
        }

        if (! $game) {
            $game = $this->findGameBySession();
        }

        $this->afterGameFound($game);

        return $next(collect(['game' => $game, 'request' => $request]));
    }
}
