<?php

namespace App\Pipelines\v1\Companies\TheBigHit\Getter;

use App\Enums\Seamless\TheBigHit\TheBigHitStatusCode;
use App\Exceptions\Seamless\FailureException;
use App\Http\Requests\Seamless\TheBigHit\ResultRequest;
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
    public function handle(ResultRequest $request, Closure $next)
    {
        $gameId = $request->getGameId();

        $game = null;

        if ($gameId) {
            $game = $this->findGame($gameId);
            throw_unless($game, new FailureException(__('thebighit.game_not_found'), customCode: TheBigHitStatusCode::MISSING_GAME_ID_VALUE));
        }

        if (! $game) {
            $game = $this->findGameBySession();
        }

        $this->afterGameFound($game);

        return $next(collect(['game' => $game, 'request' => $request]));
    }
}
