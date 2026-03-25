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
            })->limit(50);
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
