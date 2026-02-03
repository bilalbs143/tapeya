<?php

namespace App\Http\Controllers\v1\User;

use App\Http\Resources\v1\Game\GameResource;
use App\Models\Game;
use Spatie\QueryBuilder\QueryBuilder;

class GameController extends BaseUserController
{
    public function __construct()
    {
        parent::__construct(Game::class, GameResource::class);
    }

    protected function baseQuery()
    {
        return $this->model->whereHas('provider', function ($query) {
            $query->active();
        })->active()->with('provider', 'company');
    }

    public function index()
    {
        $records = QueryBuilder::for($this->baseQuery())
            ->where('is_lobby_game', false)
            ->allowedFilters($this->model->getFilters())
            ->inRandomOrder()
            ->when(
                request()->has('all'),
                fn ($query) => $query->get(),
                fn ($query) => $query->pagination()
            );

        return $this->resource::collection($records);
    }

    public function show(Game $game)
    {
        return $this->_show($game);
    }

    public function launch(Game $game)
    {
        $game = $this->refresh($game);

        if ($game->provider->isDisabled()) {
            return $this->failure('provider_is_currently_not_available');
        }

        $launchUrlData = $game->launch(request('language', 'en'));

        if ($launchUrlData) {
            return $this->success(['launch_url' => $launchUrlData->get('launch_url')]);
        }

        return $this->failure('launch_url_could_not_be_generated');
    }

    public function getLobbyGames()
    {
        $games = $this->baseQuery()->where('is_lobby_game', true)->get();

        $mapping = $this->baseQuery()->where('is_lobby_game', true)->pluck('id', 'sub_provider')->toArray();

        return $this->success([
            'mapping' => $mapping,
            'games' => $this->resource::collection($games),
        ]);
    }
}
