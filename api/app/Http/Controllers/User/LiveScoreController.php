<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\User\LiveScoreResource;
use App\Services\LiveScoreFeedService;
use Illuminate\Http\JsonResponse;

class LiveScoreController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly LiveScoreFeedService $liveScores,
    ) {}

    /**
     * In-progress open-tournament cricket scores for the Home Live Score slider.
     */
    public function index(): JsonResponse
    {
        $rows = $this->liveScores->list(LiveScoreFeedService::DEFAULT_LIMIT);

        return $this->success(LiveScoreResource::collection(collect($rows)));
    }
}
