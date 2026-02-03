<?php

namespace App\Http\Controllers\v1\User;

use App\Enums\SystemSetting\SystemSettingKeyEnum;
use App\Http\Resources\v1\SystemSetting\SystemSettingResource;
use App\Models\SystemSetting;

class SystemSettingController extends BaseUserController
{
    public function __construct()
    {
        parent::__construct(SystemSetting::class, SystemSettingResource::class, 'system_setting');
    }

    public function baseQuery()
    {
        return $this->model->whereIn('key', [
            SystemSettingKeyEnum::BANK_INFO_FOR_QUICK_INQUIRY,
            SystemSettingKeyEnum::LIVE_CHAT_HTML_CODE,
            SystemSettingKeyEnum::TRACKING_HTML_CODE,
        ]);
    }

    private function find(string $key)
    {
        return $this->baseQuery()->where('key', $key)->firstOrFail();
    }

    public function show(string $key)
    {
        $record = $this->find($key);

        return new $this->resource($record);
    }
}
