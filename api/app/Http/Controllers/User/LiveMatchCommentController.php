<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\SendLiveCommentRequest;
use App\Models\TournamentMatch;
use App\Services\LiveChat\LiveMatchCommentService;
use Illuminate\Http\JsonResponse;

class LiveMatchCommentController extends Controller
{
    use BaseControllerTrait;

    public function __construct(private readonly LiveMatchCommentService $service) {}

    /**
     * POST /api/v1/matches/{match}/live-comments
     */
    public function store(SendLiveCommentRequest $request, TournamentMatch $match): JsonResponse
    {
        $user = $request->user();

        $id = $this->service->send(
            match: $match->loadMissing('stream'),
            userId: (int) $user->id,
            displayName: $user->nickname ?: 'Viewer',
            rawBody: $request->validated('body'),
        );

        return $this->success(['id' => $id], null, 'CREATED');
    }
}
