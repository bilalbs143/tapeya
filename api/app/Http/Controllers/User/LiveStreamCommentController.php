<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\SendLiveCommentRequest;
use App\Models\MatchStream;
use App\Services\LiveChat\LiveStreamCommentService;
use Illuminate\Http\JsonResponse;

class LiveStreamCommentController extends Controller
{
    use BaseControllerTrait;

    public function __construct(private readonly LiveStreamCommentService $service) {}

    /**
     * POST /api/v1/live/streams/{stream}/live-comments
     */
    public function store(SendLiveCommentRequest $request, MatchStream $stream): JsonResponse
    {
        $user = $request->user();

        $id = $this->service->send(
            stream: $stream,
            userId: (int) $user->id,
            displayName: $user->nickname ?: 'Viewer',
            rawBody: $request->validated('body'),
        );

        return $this->success(['id' => $id], null, 'CREATED');
    }
}
