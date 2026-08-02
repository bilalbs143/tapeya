<?php

namespace App\Http\Controllers\Admin;

use App\Enums\SystemSetting\SystemSettingKeyEnum;
use App\Http\Requests\Admin\SystemSetting\UpdateSystemSettingRequest;
use App\Http\Resources\SystemSettingResource;
use App\Settings\SystemSettingRegistry;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;

class SystemSettingController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(null, SystemSettingResource::class, 'System Setting');
    }

    /** @phpstan-ignore-next-line */
    protected function baseQuery() {}

    public function index(): JsonResponse
    {
        $keys = collect(SystemSettingKeyEnum::cases())
            ->filter(fn (SystemSettingKeyEnum $k) => SystemSettingRegistry::isRegistered($k))
            ->when(request('filter.group'), fn (Collection $c, string $g) => $c->filter(
                fn (SystemSettingKeyEnum $k) => $k->group()->value === $g
            ))
            ->when(request('filter.key'), fn (Collection $c, string $k) => $c->filter(
                fn (SystemSettingKeyEnum $key) => $key->value === $k
            ))
            ->sortBy(fn (SystemSettingKeyEnum $k) => $k->group()->value.$k->value)
            ->values();

        return $this->success(SystemSettingResource::collection($keys));
    }

    public function show(string $key): JsonResponse
    {
        $enumKey = SystemSettingKeyEnum::tryFrom($key) ?? abort(404);
        if (! SystemSettingRegistry::isRegistered($enumKey)) {
            abort(404);
        }

        return $this->success(new SystemSettingResource($enumKey));
    }

    public function patch(UpdateSystemSettingRequest $request, string $key): JsonResponse
    {
        $enumKey = SystemSettingKeyEnum::tryFrom($key) ?? abort(404);
        if (! SystemSettingRegistry::isRegistered($enumKey)) {
            abort(404);
        }

        $plain = $request->validated('value');

        $enumKey->type()->validateValue($plain);

        $enumKey->write($enumKey->deserialize($plain));

        return $this->success(new SystemSettingResource($enumKey), 'System setting updated.');
    }
}
