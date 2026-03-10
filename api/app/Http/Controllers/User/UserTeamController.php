<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\User\TeamResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;

/**
 * Teams that a user (player) belongs to (squad member via team_user).
 * GET /users/{user}/teams
 */
class UserTeamController extends Controller
{
    use BaseControllerTrait;

    public function index(User $user): JsonResponse
    {
        $teams = $user->teams()->with(['sponsor'])->orderBy('name')->get();

        return $this->success(TeamResource::collection($teams));
    }
}
