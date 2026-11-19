<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\Ad\StoreAdEventsRequest;
use App\Services\Ad\AdEventIngestService;
use Illuminate\Http\JsonResponse;

class AdEventController extends Controller
{
    use BaseControllerTrait;

    public function __construct(private readonly AdEventIngestService $ingest) {}

    public function store(StoreAdEventsRequest $request): JsonResponse
    {
        $result = $this->ingest->ingest($request->user(), $request->validated('events'));

        return $this->success($result, 'Ad events processed.');
    }
}
