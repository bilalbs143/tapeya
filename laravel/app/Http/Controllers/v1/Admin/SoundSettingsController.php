<?php

namespace App\Http\Controllers\v1\Admin;

use App\Enums\SoundSettings\SoundSettingsTypeEnum;
use App\Http\Requests\v1\Admin\SoundSettings\CreateSoundSettingRequest;
use App\Http\Requests\v1\Admin\SoundSettings\UpdateSoundSettingRequest;
use App\Http\Resources\v1\SoundSettings\SoundSettingResource;
use App\Models\SoundSetting;

class SoundSettingsController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(SoundSetting::class, SoundSettingResource::class, 'sound_setting');
    }

    protected function baseQuery()
    {
        return $this->model->with([
            'creator',
            'editor',
            'sound',
        ]);
    }

    public function getTypes()
    {
        return response()->json([
            'data' => SoundSettingsTypeEnum::withLabels(),
        ]);
    }

    public function store(CreateSoundSettingRequest $request)
    {
        return $this->_store($request);
    }

    public function patch(UpdateSoundSettingRequest $request, SoundSetting $soundSetting)
    {
        return $this->_patch($request, $soundSetting);
    }

    public function show(SoundSetting $soundSetting)
    {
        return $this->_show($soundSetting);
    }

    public function destroy(SoundSetting $soundSetting)
    {
        return $this->_destroy($soundSetting, force: true);
    }
}
