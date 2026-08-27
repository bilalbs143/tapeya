<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Common\StatusEnum;
use App\Http\Requests\Admin\HeroSlider\HeroSliderCtaRules;
use App\Http\Requests\Admin\HeroSlider\StoreHeroSliderRequest;
use App\Http\Requests\Admin\HeroSlider\UpdateHeroSliderRequest;
use App\Http\Resources\Admin\HeroSlider\HeroSliderResource;
use App\Models\HeroSlider;
use App\Support\Media\MediaDisk;
use Illuminate\Http\JsonResponse;

class HeroSliderController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(HeroSlider::class, HeroSliderResource::class, 'hero slider');
    }

    protected function baseQuery()
    {
        return HeroSlider::query();
    }

    public function store(StoreHeroSliderRequest $request): JsonResponse
    {
        $data = array_merge(
            ['status' => StatusEnum::from($request->validated('status'))],
            HeroSliderCtaRules::payload($request->validated(), $request->boolean('cta_target_blank', true)),
        );
        $record = $this->model->create($data);
        $record = $this->refresh($record);

        return $this->success(new HeroSliderResource($record), null, 'CREATED');
    }

    public function show(HeroSlider $hero_slider): JsonResponse
    {
        return $this->_show($hero_slider);
    }

    public function update(UpdateHeroSliderRequest $request, HeroSlider $hero_slider): JsonResponse
    {
        $targetBlank = array_key_exists('cta_target_blank', $request->validated())
            ? $request->boolean('cta_target_blank')
            : (bool) $hero_slider->cta_target_blank;
        $data = array_merge(
            ['status' => StatusEnum::from($request->validated('status'))],
            HeroSliderCtaRules::payload($request->validated(), $targetBlank),
        );
        $hero_slider = $this->refresh($hero_slider);
        $hero_slider->update($data);
        $hero_slider = $this->refresh($hero_slider);

        return $this->success(new HeroSliderResource($hero_slider), 'Hero Slider Updated.');
    }

    public function destroy(HeroSlider $hero_slider): JsonResponse
    {
        $hero_slider = $this->refresh($hero_slider);
        foreach (['image_mobile', 'image_desktop'] as $field) {
            MediaDisk::delete($hero_slider->getRawOriginal($field));
        }
        $hero_slider->delete();

        return $this->noContent();
    }
}
