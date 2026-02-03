<?php

namespace App\Http\Controllers\v1\User;

use App\Enums\AppRelease\AppOsEnum;
use App\Enums\AppRelease\AppTypeEnum;
use App\Models\AppRelease;

class AppReleaseController extends BaseUserController
{
    protected function baseQuery()
    {
        return null;
    }

    public function download(AppOsEnum $os)
    {
        $appRelease = AppRelease::byLatestVersion($os, AppTypeEnum::RELEASE)->firstOrFail();

        return $appRelease->download();
    }
}
