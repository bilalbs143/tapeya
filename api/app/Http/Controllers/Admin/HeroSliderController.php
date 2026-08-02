<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Common\StatusEnum;
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
        $data = [
            'status' => StatusEnum::from($request->validated('status')),
        ];
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
        $data = [
            'status' => StatusEnum::from($request->validated('status')),
        ];
        $hero_slider = $this->refresh($hero_slider);
        $hero_slider->update($data);
        $hero_slider = $this->refresh($hero_slider);

        return $this->success(new HeroSliderResource($hero_slider), 'Hero slider updated.');
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
