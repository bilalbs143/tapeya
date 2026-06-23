<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class PlayerController extends Controller
{
    use BaseControllerTrait;

    /**
     * List users eligible for tournament team squads (players, sponsors, organizers).
     * GET /players?search=... — optional search by name, nickname, or phone (partial match).
     */
    public function index(): JsonResponse
    {
        $search = request()->str('search')->trim();

        $query = User::query()
            ->appUsers()
            ->eligibleForTournamentSquad()
            ->orderBy('name');

        if ($search->isNotEmpty()) {
            $query->search($search->toString());
        }

        $players = $query->limit(50)->get(['id', 'name', 'nickname', 'playing_role']);

        $data = $players->map(fn (User $u) => [
            'id' => $u->id,
            'name' => $u->name,
            'nickname' => $u->nickname,
            'playing_role' => $u->playing_role?->label(),
            'playing_role_enum' => $u->playing_role?->name,
        ])->values()->all();

        return $this->success($data);
    }
}
