<?php

namespace App\Http\Controllers\v1\Admin;

use App\Http\Requests\v1\Admin\SystemSetting\UpdateSystemSettingRequest;
use App\Http\Resources\v1\SystemSetting\SystemSettingResource;
use App\Models\SystemSetting;

class SystemSettingController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(SystemSetting::class, SystemSettingResource::class, 'system_setting');
    }

    public function baseQuery()
    {
        return $this->model->query();
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

    public function patch(UpdateSystemSettingRequest $request, string $key)
    {
        $record = $this->find($key);

        $record->type->validateValue($record->key, $request->value);

        return $this->_patch($request, $record);
    }
}
