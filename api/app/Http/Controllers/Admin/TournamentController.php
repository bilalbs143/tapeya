<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\Admin\StoreTournamentRequest;
use App\Http\Requests\Admin\UpdateTournamentRequest;
use App\Http\Resources\Admin\TournamentResource;
use App\Models\Tournament;
use App\Support\Media\MediaDisk;
use Illuminate\Http\JsonResponse;

class TournamentController extends BaseAdminController
{
    private const TOURNAMENTS_IMAGE_DIR = 'tournaments';

    public function __construct()
    {
        parent::__construct(Tournament::class, TournamentResource::class, 'tournament');
    }

    protected function baseQuery()
    {
        $query = Tournament::query()
            ->with(['organizer', 'creator'])
            ->withSquadPlayerCount();
        $user = request()->user();
        if ($user && $user->hasBroadcastBackofficeRole()) {
            $query->where(function ($q) use ($user) {
                $q->where('organizer_id', $user->id)
                    ->orWhere('created_by', $user->id)
                    ->orWhereHas('broadcasters', fn ($b) => $b->whereKey($user->id));
            });
        }

        return $query;
    }

    public function store(StoreTournamentRequest $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validated();
        if ($user) {
            $data['created_by'] = $user->id;
        }

        $record = $this->model->create($data);
        if ($user && $user->hasBroadcastBackofficeRole()) {
            $record->broadcasters()->sync([$user->id]);
        }
        $record = $this->refresh($record);

        return $this->success(new TournamentResource($record), 'Tournament created.', 'CREATED');
    }

    public function show(Tournament $tournament): JsonResponse
    {
        return $this->_show($tournament);
    }

    public function update(UpdateTournamentRequest $request, Tournament $tournament): JsonResponse
    {
        $data = $request->validated();

        $tournament = $this->refresh($tournament);
        $tournament->update($data);
        $tournament = $this->refresh($tournament);

        return $this->success(new TournamentResource($tournament), 'Tournament updated.');
    }

    public function destroy(Tournament $tournament): JsonResponse
    {
        $tournament = $this->refresh($tournament);
        MediaDisk::delete($tournament->getRawOriginal('display_image'));
        MediaDisk::delete($tournament->getRawOriginal('cover_image'));
        $tournament->delete();

        return $this->noContent();
    }
}
