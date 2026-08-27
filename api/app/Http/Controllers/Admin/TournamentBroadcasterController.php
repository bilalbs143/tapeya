<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTournamentBroadcasterRequest;
use App\Http\Resources\Admin\TournamentBroadcasterUserResource;
use App\Models\Tournament;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class TournamentBroadcasterController extends Controller
{
    use BaseControllerTrait;

    public function index(Tournament $tournament): JsonResponse
    {
        $user = $tournament->broadcasters()
            ->orderBy('name')
            ->first();

        return $this->success(
            $user ? new TournamentBroadcasterUserResource($user) : null
        );
    }

    public function store(StoreTournamentBroadcasterRequest $request, Tournament $tournament): JsonResponse
    {
        $data = $request->validated();
        $userId = (int) $data['user_id'];
        $target = User::query()->user()->notBlocked()->whereKey($userId)->first();
        if (! $target) {
            return $this->failure('User not found or cannot be assigned.', 'VALIDATION_ERROR');
        }

        $tournament->broadcasters()->sync([$target->id]);

        return $this->success(
            new TournamentBroadcasterUserResource($target),
            'Tournament broadcaster updated.',
            'CREATED'
        );
    }

    /** Clears the single tournament broadcast staff assignment (if any). */
    public function destroy(Tournament $tournament): JsonResponse
    {
        $tournament->broadcasters()->detach();

        return $this->noContent();
    }
}
