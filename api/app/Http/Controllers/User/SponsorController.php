<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class SponsorController extends Controller
{
    use BaseControllerTrait;

    /**
     * List app users for team owner / sponsor dropdown (not restricted to sponsor role).
     * GET /sponsors?search=... — search by name, nickname, or phone (partial match). Limit 50.
     */
    public function index(): JsonResponse
    {
        $search = request()->str('search')->trim();
        $query = User::query()
            ->appUsers()
            ->orderBy('name');

        if ($search->isNotEmpty()) {
            $query->search($search->toString())->limit(50);
        } else {
            $query->limit(0); // require search to avoid returning thousands
        }

        $sponsors = $query->get(['id', 'name']);

        $data = $sponsors->map(fn (User $u) => [
            'id' => $u->id,
            'name' => $u->name,
        ])->values()->all();

        return $this->success($data);
    }
}
