<?php

namespace App\Utils\Services;

use App\Http\Resources\v1\Auth\LoginResource;
use App\Models\User;
use Laravel\Sanctum\NewAccessToken;

class ResponseService
{
    public static function loginResponse(User $user, ?NewAccessToken $token = null)
    {
        $user = User::with('bank_account')->findOrFail($user->id);
        if ($token === null) {
            $tokenResult = $user->createAuthToken();
        } else {
            $tokenResult = $token;
        }

        $data['user'] = new LoginResource($user);

        $data['auth'] = [
            'access_token' => $tokenResult->plainTextToken,
            'token_type' => 'Bearer',
            'expires_at' => $tokenResult->accessToken->expires_at,
        ];

        return $data;
    }
}
