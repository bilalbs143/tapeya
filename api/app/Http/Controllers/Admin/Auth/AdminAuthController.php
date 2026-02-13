<?php

namespace App\Http\Controllers\Admin\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Auth\LoginRequest;
use App\Http\Resources\Admin\Auth\LoginResource;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class AdminAuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! $user->isAdmin() || $user->isSystem() || ! Auth::attempt($credentials)) {
            return response()->failure('Invalid credentials', 'UNAUTHORIZED');
        }

        $token = $user->createToken('admin')->plainTextToken;

        $data = [
            'user' => new LoginResource($user),
            'auth' => [
                'access_token' => $token,
                'token_type' => 'Bearer',
            ],
        ];

        return response()->success($data, 'auth.logged_in', 'SUCCESS');
    }

    public function logout()
    {
        request()->user()->currentAccessToken()?->delete();

        return response()->success(message: 'auth.logged_out');
    }
}
