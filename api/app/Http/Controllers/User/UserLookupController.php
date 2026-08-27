<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

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
     *
     * GET /users/lookup?mine=1 — users this actor created (e.g. Quick Match walk-ups), ordered by name.
     * Optional search narrows that list. Limit 100.
     */
    public function index(Request $request): JsonResponse
    {
        if ($request->boolean('mine')) {
            return $this->success($this->mapLookupUsers(
                $this->mineQuery($request)->get(['id', 'name', 'nickname', 'phone', 'playing_role'])
            ));
        }

        $search = $request->str('search')->trim();

        if ($search->isEmpty()) {
            return $this->success([]);
        }

        $users = User::query()
            ->eligibleForTournamentSquad()
            ->search($search->toString())
            ->orderBy('name')
            ->limit(50)
            ->get(['id', 'name', 'nickname', 'phone', 'playing_role']);

        return $this->success($this->mapLookupUsers($users));
    }

    /**
     * @return Builder<User>
     */
    private function mineQuery(Request $request)
    {
        $query = User::query()
            ->eligibleForTournamentSquad()
            ->where('created_by', $request->user()->id)
            ->orderBy('name')
            ->limit(100);

        $search = $request->str('search')->trim();
        if ($search->isNotEmpty()) {
            $query->search($search->toString());
        }

        return $query;
    }

    /**
     * @param  Collection<int, User>|\Illuminate\Database\Eloquent\Collection<int, User>  $users
     * @return list<array{id: int, name: ?string, nickname: ?string, phone: ?string, playing_role: ?string, playing_role_enum: ?string}>
     */
    private function mapLookupUsers($users): array
    {
        return $users->map(fn (User $u) => [
            'id' => $u->id,
            'name' => $u->name,
            'nickname' => $u->nickname,
            'phone' => $u->phone,
            'playing_role' => $u->playing_role?->label(),
            'playing_role_enum' => $u->playing_role?->name,
        ])->values()->all();
    }
}
