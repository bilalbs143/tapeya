<?php

namespace App\Http\Controllers\v1\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\v1\User\Promotion\ActivatePromotionRequest;
use App\Http\Resources\v1\Promotion\PromotionProgressResource;
use App\Http\Resources\v1\Promotion\PromotionResource;
use App\Models\Promotion;
use App\Models\PromotionProgress;
use App\Promotions\Services\PromotionActivationService;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
    public function __construct(
        private readonly PromotionActivationService $activationService
    ) {}

    public function index()
    {
        $promotions = Promotion::query()
            ->where('is_visible', true)
            ->get();

        return response()->success(PromotionResource::collection($promotions));
    }

    public function show(Promotion $promotion)
    {
        if (! $promotion->is_visible) {
            return response()->forbidden();
        }

        return response()->success(new PromotionResource($promotion));
    }

    public function activate(ActivatePromotionRequest $request, Promotion $promotion)
    {
        $progress = $this->activationService->activate($promotion, $request->user());

        return response()->success(new PromotionProgressResource($progress));
    }

    public function redeem(Request $request, Promotion $promotion)
    {
        $progress = PromotionProgress::where('promotion_id', $promotion->id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $progress = $this->activationService->redeem($progress);

        return response()->success(new PromotionProgressResource($progress), null, 200);
    }
}
