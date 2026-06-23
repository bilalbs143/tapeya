<?php

namespace App\Http\Controllers\User;

use App\Enums\User\ActivePlatformEnum;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserActivePlatformController extends Controller
{
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'platform' => ['required', 'string', Rule::in(ActivePlatformEnum::storedValues())],
        ]);

        $request->user()->update([
            'active_platform' => $validated['platform'],
            'active_platform_updated_at' => now(),
        ]);

        return response()->success(null, 'Platform updated.');
    }
}
