<?php

namespace App\Pipelines\v1\Companies\FourTen\Getter;

use App\Enums\Seamless\FourTen\FourTenStatusCode;
use App\Exceptions\Seamless\FailureException;
use App\Http\Requests\Seamless\FourTen\BaseFourTenRequest;
use App\Pipelines\v1\Companies\Common\Base\BaseSeamlessPipe;
use Closure;

class GetGame extends BaseSeamlessPipe
{
    /**
     * Handle the given input.
     *
     * @return mixed
     */
    public function handle(BaseFourTenRequest $request, Closure $next)
    {
        $gameId = $request->getGameId();

        $game = null;

        if ($gameId) {
            $game = $this->findGame($gameId);
            throw_unless($game, new FailureException(__('fourten.game_not_found'), customCode: FourTenStatusCode::MISSING_GAME_ID_VALUE));
        }

        if (! $game) {
            $game = $this->findGameBySession();
        }

        $this->afterGameFound($game);

        return $next(collect(['game' => $game, 'request' => $request]));
    }
}
