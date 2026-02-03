<?php

namespace App\Http\Controllers\v1\User;

use App\Http\Controllers\Controller;
use App\Http\Resources\v1\Promotion\PromotionProgressResource;
use App\Models\PromotionProgress;
use Illuminate\Http\Request;

class PromotionProgressController extends Controller
{
    public function index(Request $request)
    {
        $query = PromotionProgress::query()
            ->where('user_id', $request->user()->id)
            ->with(['promotion'])
            ->when($request->filled('state'), fn ($q) => $q->where('state', $request->get('state')))
            ->when($request->filled('promotion_id'), fn ($q) => $q->where('promotion_id', $request->get('promotion_id')))
            ->latest('id');

        $progress = $request->boolean('all')
            ? $query->get()
            : $query->pagination();

        return PromotionProgressResource::collection($progress);
    }
}
