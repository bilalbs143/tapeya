<?php

namespace App\Http\Controllers\User;

use App\Enums\SystemSetting\SystemSettingKeyEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\SystemSettingResource;
use Illuminate\Http\JsonResponse;

class SystemSettingController extends Controller
{
    use BaseControllerTrait;

    public function index(): JsonResponse
    {
        $keys = collect(SystemSettingKeyEnum::publicKeys())
            ->sortBy(fn (SystemSettingKeyEnum $k) => $k->group()->value.$k->value)
            ->values();

        return $this->success(SystemSettingResource::collection($keys));
    }
}
