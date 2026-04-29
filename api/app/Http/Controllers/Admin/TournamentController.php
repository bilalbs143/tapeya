<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\Admin\StoreTournamentRequest;
use App\Http\Requests\Admin\UpdateTournamentRequest;
use App\Http\Resources\Admin\TournamentResource;
use App\Models\Tournament;
use App\Http\Controllers\Admin\Concerns\EnsuresTournamentStaffAppRoles;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class TournamentController extends BaseAdminController
{
    use EnsuresTournamentStaffAppRoles;

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

        $this->storeImage($request, 'display_image', self::TOURNAMENTS_IMAGE_DIR, $data);
        $this->storeImage($request, 'cover_image', self::TOURNAMENTS_IMAGE_DIR, $data);

        $record = $this->model->create($data);
        $this->ensureOrganizerRole($record->organizer_id);
        if ($user && $user->hasBroadcastBackofficeRole()) {
            $record->broadcasters()->sync([$user->id]);
            $this->ensureOrganizerRole($user->id);
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

        $this->storeImage($request, 'display_image', self::TOURNAMENTS_IMAGE_DIR, $data, $tournament);
        $this->storeImage($request, 'cover_image', self::TOURNAMENTS_IMAGE_DIR, $data, $tournament);

        $tournament = $this->refresh($tournament);
        $tournament->update($data);
        if (isset($data['organizer_id'])) {
            $this->ensureOrganizerRole($data['organizer_id']);
        }
        $tournament = $this->refresh($tournament);

        return $this->success(new TournamentResource($tournament), 'Tournament updated.');
    }

    public function destroy(Tournament $tournament): JsonResponse
    {
        $tournament = $this->refresh($tournament);
        $disk = Storage::disk(config('filesystems.media_disk'));
        if ($tournament->display_image) {
            $disk->delete($tournament->display_image);
        }
        if ($tournament->cover_image) {
            $disk->delete($tournament->cover_image);
        }
        $tournament->delete();

        return $this->noContent();
    }
}
