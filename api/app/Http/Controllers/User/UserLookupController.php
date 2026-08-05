<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;

/**
 * App-user typeahead for team owner, squad, and icon pickers.
 * Distinct from {@see UserFollowController::search} (mentions / follow — nickname + social rank).
 */
class UserLookupController extends Controller
{
    use BaseControllerTrait;

    /**
     * GET /users/lookup?search=... — any non-blocked app user (name / nickname / phone).
     * Empty / absent search returns [] (require a term — no unprompted directory dump). Limit 50.
     */
    public function index(): JsonResponse
    {
        $search = request()->str('search')->trim();

        if ($search->isEmpty()) {
            return $this->success([]);
        }

        $users = User::query()
            ->eligibleForTournamentSquad()
            ->search($search->toString())
            ->orderBy('name')
            ->limit(50)
            ->get(['id', 'name', 'nickname', 'playing_role']);

        $data = $users->map(fn (User $u) => [
            'id' => $u->id,
            'name' => $u->name,
            'nickname' => $u->nickname,
            'playing_role' => $u->playing_role?->label(),
            'playing_role_enum' => $u->playing_role?->name,
        ])->values()->all();

        return $this->success($data);
    }
}
