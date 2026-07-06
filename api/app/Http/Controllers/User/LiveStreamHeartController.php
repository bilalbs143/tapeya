<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Models\MatchStream;
use App\Services\LiveChat\LiveStreamHeartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LiveStreamHeartController extends Controller
{
    use BaseControllerTrait;

    public function __construct(private readonly LiveStreamHeartService $service) {}

    /**
     * POST /api/v1/live/streams/{stream}/live-hearts
     */
    public function store(Request $request, MatchStream $stream): JsonResponse
    {
        $this->service->send($stream, $request->user());

        return $this->noContent();
    }
}
