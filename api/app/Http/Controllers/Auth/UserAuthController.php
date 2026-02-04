<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\Auth\LoginResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserAuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! $user->isUser() || $user->isSystem() || ! Auth::attempt($credentials)) {
            return response()->failure('Invalid credentials', 'UNAUTHORIZED');
        }

        $token = $user->createToken('app')->plainTextToken;

        $data = [
            'user' => new LoginResource($user),
            'auth' => [
                'access_token' => $token,
                'token_type' => 'Bearer',
            ],
        ];

        return response()->success($data, 'auth.logged_in', 'SUCCESS');
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->success(message: 'auth.logged_out');
    }
}

