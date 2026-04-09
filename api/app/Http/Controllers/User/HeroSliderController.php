<?php

namespace App\Http\Controllers\User;

use App\Enums\Common\StatusEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\User\HeroSliderResource;
use App\Models\HeroSlider;
use Illuminate\Http\JsonResponse;

class HeroSliderController extends Controller
{
    use BaseControllerTrait;

    /**
     * List active hero sliders for the app home.
     */
    public function index(): JsonResponse
    {
        $sliders = HeroSlider::query()
            ->where('status', StatusEnum::ACTIVE)
            ->whereNotNull('image_mobile')
            ->orderBy('id')
            ->get();

        return $this->success(HeroSliderResource::collection($sliders));
    }
}
