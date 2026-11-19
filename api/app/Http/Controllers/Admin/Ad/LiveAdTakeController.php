<?php

namespace App\Http\Controllers\Admin\Ad;

use App\Enums\Ad\LiveAdTakeModeEnum;
use App\Enums\Ad\LiveAdTakeStatusEnum;
use App\Http\Controllers\Admin\BaseAdminController;
use App\Http\Requests\Admin\Ad\StartLiveAdTakeRequest;
use App\Http\Resources\Admin\Ad\LiveAdTakeResource;
use App\Models\AdCreative;
use App\Models\LiveAdTake;
use App\Services\Ad\LiveAdTakeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LiveAdTakeController extends BaseAdminController
{
    public function __construct(private readonly LiveAdTakeService $takeService)
    {
        parent::__construct(LiveAdTake::class, LiveAdTakeResource::class, 'live ad take');
    }

    protected function baseQuery()
    {
        return LiveAdTake::query()->with(['creative.campaign.brandPartner', 'streams']);
    }

    /** On-air takes (status=live). */
    public function index(): JsonResponse
    {
        $query = $this->baseQuery()
            ->where('status', LiveAdTakeStatusEnum::Live)
            ->orderByDesc('started_at');

        return $this->success(LiveAdTakeResource::collection($this->paginateOrAll($query)));
    }

    public function store(StartLiveAdTakeRequest $request): JsonResponse
    {
        $data = $request->validated();
        $creative = AdCreative::query()->findOrFail((int) $data['creative_id']);

        $take = $this->takeService->start(
            $creative,
            LiveAdTakeModeEnum::from($data['mode']),
            $data['stream_ids'],
            $request->user(),
            (bool) ($data['replace'] ?? false),
            $data['note'] ?? null,
            $data['presentation_json'] ?? null,
        );

        return $this->success(new LiveAdTakeResource($take), 'Live ad take started.', 'CREATED');
    }

    public function end(Request $request, LiveAdTake $live_ad_take): JsonResponse
    {
        $take = $this->takeService->end($live_ad_take, $request->user());

        return $this->success(new LiveAdTakeResource($take), 'Live ad take ended.');
    }

    public function endAll(Request $request): JsonResponse
    {
        $request->validate([
            'stream_id' => ['sometimes', 'nullable', 'integer', 'exists:live_streams,id'],
        ]);

        $streamId = $request->input('stream_id');
        if ($streamId !== null && $streamId !== '') {
            $ended = $this->takeService->endAllForStream((int) $streamId, $request->user());

            return $this->success(['ended' => $ended], $ended ? 'Live ad take ended.' : 'No live take on stream.');
        }

        $ended = $this->takeService->endAllLive($request->user());

        return $this->success(['ended' => $ended], $ended > 0 ? 'All live ad takes ended.' : 'No live takes.');
    }
}
