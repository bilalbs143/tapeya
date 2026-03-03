<?php

namespace App\Http\Controllers\Admin;

use App\Enums\User\AppRoleEnum;
use App\Enums\User\RoleGuardEnum;
use App\Http\Requests\Admin\StoreTournamentRequest;
use App\Http\Requests\Admin\UpdateTournamentRequest;
use App\Http\Resources\Admin\TournamentResource;
use App\Models\Role;
use App\Models\Tournament;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class TournamentController extends BaseAdminController
{
    private const TOURNAMENTS_IMAGE_DIR = 'tournaments';

    public function __construct()
    {
        parent::__construct(Tournament::class, TournamentResource::class, 'tournament');
    }

    protected function baseQuery()
    {
        return Tournament::query()->with('organizer');
    }

    public function store(StoreTournamentRequest $request): JsonResponse
    {
        $data = $request->validated();

        $this->storeImage($request, 'display_image', self::TOURNAMENTS_IMAGE_DIR, $data);
        $this->storeImage($request, 'cover_image', self::TOURNAMENTS_IMAGE_DIR, $data);

        $record = $this->model->create($data);
        $this->ensureOrganizerRole($record->organizer_id);
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

    /**
     * Ensure the user has the Organizer role when assigned to a tournament.
     */
    private function ensureOrganizerRole(int $organizerId): void
    {
        $organizerRole = Role::findBySlug(AppRoleEnum::ORGANIZER->value, RoleGuardEnum::APP->value);
        if (! $organizerRole) {
            return;
        }

        $user = User::find($organizerId);
        if ($user && ! $user->hasRole(AppRoleEnum::ORGANIZER)) {
            $user->roles()->syncWithoutDetaching([$organizerRole->id]);
        }
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
