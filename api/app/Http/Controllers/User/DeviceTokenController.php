<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\RegisterDeviceTokenRequest;
use App\Models\DeviceToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class DeviceTokenController extends Controller
{
    public function store(RegisterDeviceTokenRequest $request): JsonResponse
    {
        $user = Auth::user();
        $validated = $request->validated();

        DeviceToken::query()->updateOrCreate(
            [
                'user_id' => $user->id,
                'token' => $validated['token'],
            ],
            [
                'platform' => $validated['platform'],
                'app_version' => $validated['app_version'] ?? null,
                'is_active' => true,
                'last_seen_at' => now(),
            ]
        );

        return response()->success(null, 'Device token registered.');
    }
}
