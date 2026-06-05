<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Models\TournamentMatch;
use App\Services\LiveChat\LiveMatchHeartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LiveMatchHeartController extends Controller
{
    use BaseControllerTrait;

    public function __construct(private readonly LiveMatchHeartService $service) {}

    /**
     * POST /api/v1/matches/{match}/live-hearts
     */
    public function store(Request $request, TournamentMatch $match): JsonResponse
    {
        $this->service->send(
            match: $match->loadMissing('stream'),
            userId: (int) $request->user()->id,
        );

        return $this->success([], null, 'CREATED');
    }
}
