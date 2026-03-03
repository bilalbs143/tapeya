<?php

namespace App\Http\Controllers\User;

use App\Enums\User\AppRoleEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class PlayerController extends Controller
{
    use BaseControllerTrait;

    /**
     * List users with player role (for icon players, squad picker, etc.).
     * GET /players?search=... — optional search by name, nickname, or phone (partial match).
     */
    public function index(): JsonResponse
    {
        $search = request()->str('search')->trim();
        $query = User::query()
            ->appUsers()
            ->withRole(AppRoleEnum::PLAYER)
            ->orderBy('name');

        if ($search->isNotEmpty()) {
            $term = '%'.mb_strtolower($search->toString()).'%';
            $digits = preg_replace('/\D/', '', $search->toString());
            $phoneLike = $digits !== '' ? '%'.$digits.'%' : null;

            $phoneExpr = "REGEXP_REPLACE(COALESCE(phone, ''), '[^0-9]', '', 'g') LIKE ?";

            $query->where(function ($q) use ($term, $phoneLike, $phoneExpr) {
                $q->whereRaw('LOWER(name) LIKE ?', [$term])
                    ->orWhereRaw("LOWER(COALESCE(nickname, '')) LIKE ?", [$term]);
                if ($phoneLike !== null) {
                    $q->orWhereRaw($phoneExpr, [$phoneLike]);
                }
            });
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
