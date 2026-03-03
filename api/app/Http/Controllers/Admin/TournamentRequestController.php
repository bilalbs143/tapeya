<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\Admin\UpdateTournamentRequestRequest;
use App\Http\Resources\Admin\TournamentRequestResource;
use App\Models\TournamentRequest;
use Illuminate\Http\JsonResponse;

class TournamentRequestController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(TournamentRequest::class, TournamentRequestResource::class, 'tournament request');
    }

    protected function baseQuery()
    {
        return TournamentRequest::query()->with('user');
    }

    public function show(TournamentRequest $tournamentRequest): JsonResponse
    {
        return $this->_show($tournamentRequest);
    }

    public function update(UpdateTournamentRequestRequest $request, TournamentRequest $tournamentRequest): JsonResponse
    {
        return $this->_patch($request, $tournamentRequest, 'Tournament request updated.');
    }
}
