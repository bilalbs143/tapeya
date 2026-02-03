<?php

namespace App\Http\Controllers\v1\Auth;

use App\Events\Auth\LoggedIn;
use App\Http\Controllers\Controller;
use App\Http\Requests\v1\Auth\LoginRequest;
use App\Http\Requests\v1\Auth\RegisterRequest;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $response = $request->register();

        return response()->success($response, 'auth.registered');
    }

    public function login(LoginRequest $request)
    {
        if (! $request->authenticate()) {
            return response()->unauth();
        }

        $user = auth()->user();

        // logout from all sessions if user is a member
        if ($user->isMember()) {
            $user->revokeAllTokens();
        }

        LoggedIn::dispatch($user, now());

        return response()->success($user->loginResponse(), 'auth.logged_in');
    }

    public function logout()
    {
        if (request()->remove_all_sessions) {
            auth()->user()->revokeAllTokens();
        } else {
            auth()->user()->logout();
        }

        return response()->success(message: 'auth.logged_out');
    }
}
