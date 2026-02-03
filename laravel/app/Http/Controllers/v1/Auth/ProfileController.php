<?php

namespace App\Http\Controllers\v1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\v1\Auth\Profile\UpdatePasswordRequest;
use App\Http\Requests\v1\Auth\Profile\UpdateProfileRequest;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function me(Request $request)
    {
        $user = $request->user();

        return response()->success($user->getResource());
    }

    public function updateProfile(UpdateProfileRequest $request)
    {
        $user = $request->user();
        $data = $request->validated();

        $user->update($data);
        $user->updateBank($data);

        if ($user->bank_account && $user->bank_account?->isChanged()) {
            $user->touch();
        }

        return response()->success($user->getResource(), message: 'auth.profile_updated');
    }

    public function updatePassword(UpdatePasswordRequest $request)
    {
        $user = $request->user();
        $user->update([
            'password' => $request->password,
        ]);

        return response()->success(message: 'auth.password_updated');
    }
}
