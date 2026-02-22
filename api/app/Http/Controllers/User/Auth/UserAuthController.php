<?php

namespace App\Http\Controllers\User\Auth;

use App\Enums\User\AppRoleEnum;
use App\Enums\User\RoleGuardEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Events\UserRegistered;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\Auth\RegisterRequest;
use App\Http\Requests\User\Auth\RequestOtpRequest;
use App\Http\Requests\User\Auth\VerifyOtpRequest;
use App\Http\Resources\User\UserResource;
use App\Models\Role;
use App\Models\User;
use App\Utils\Services\OtpService;

/**
 * User (app) auth: phone + OTP only. No password.
 *
 * Register: POST /register (name, phone, email?) → create user, send OTP → user must verify.
 * Login:    POST /request-otp (phone) → send OTP → POST /verify-otp (phone, code) → token.
 * Both flows complete with the same verify-otp step (activates account and returns token).
 */
class UserAuthController extends Controller
{
    public function __construct(
        protected OtpService $otpService
    ) {}

    /**
     * Register: name, phone (with country code), optional email. Creates user (VERIFICATION_PENDING), sends OTP.
     * User must then call verify-otp with the code to activate and get token.
     */
    public function register(RegisterRequest $request)
    {
        $data = $request->validated();

        $user = User::create([
            'name' => $data['name'],
            'nickname' => $data['nickname'],
            'phone' => $data['phone'],
            'email' => $data['email'] ?? null,
            'password' => null,
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::VERIFICATION_PENDING,
        ]);

        $playerRole = Role::findBySlug(AppRoleEnum::PLAYER->value, RoleGuardEnum::APP->value);
        if ($playerRole) {
            $user->roles()->attach($playerRole->id);
        }

        event(new UserRegistered($user));

        $this->otpService->sendToUser($user);

        $data = ['user' => new UserResource($user)];
        if (config('app.debug')) {
            $data['otp'] = $this->otpService->getCurrentOtp($user->phone);
        }

        return response()->success($data, 'auth.otp_sent', 'SUCCESS');
    }

    /**
     * Login step 1: request OTP for existing user by phone. Then user calls verify-otp with code.
     */
    public function requestOtp(RequestOtpRequest $request)
    {
        $phone = $request->validated('phone');

        $user = User::query()
            ->where('phone', $phone)
            ->where('type', UserTypeEnum::USER)
            ->first();

        if (! $user) {
            return response()->failure('User not found. Please register first.', 'NOT_FOUND');
        }

        if ($user->isBlocked()) {
            return response()->failure('Account is blocked.', 'FORBIDDEN');
        }

        $this->otpService->sendToUser($user);

        $data = null;
        if (config('app.debug')) {
            $data = ['otp' => $this->otpService->getCurrentOtp($phone)];
        }

        return response()->success($data, 'auth.otp_sent', 'SUCCESS');
    }

    /**
     * Login step 2 (and completes register): verify OTP, set ACTIVE, return user + token.
     * Used after register (first time) or after request-otp (returning user).
     */
    public function verifyOtp(VerifyOtpRequest $request)
    {
        $phone = $request->validated('phone');
        $code = $request->validated('code');

        if (! $this->otpService->verify($phone, $code)) {
            return response()->failure('Invalid or expired OTP.', 'UNAUTHORIZED');
        }

        $user = User::query()
            ->where('phone', $phone)
            ->where('type', UserTypeEnum::USER)
            ->firstOrFail();

        if ($user->isBlocked()) {
            return response()->failure('Account is blocked.', 'FORBIDDEN');
        }

        $user->update(['status' => UserStatusEnum::ACTIVE]);
        $user = $user->fresh();

        $token = $user->createToken('app')->plainTextToken;

        $data = [
            'user' => new UserResource($user),
            'auth' => [
                'access_token' => $token,
                'token_type' => 'Bearer',
            ],
        ];

        return response()->success($data, 'auth.logged_in', 'SUCCESS');
    }

    /**
     * Current authenticated user (full profile). Requires auth:api.
     */
    public function me()
    {
        $user = request()->user()->fresh();

        return response()->success(new UserResource($user));
    }

    public function logout()
    {
        request()->user()->currentAccessToken()?->delete();

        return response()->success(message: 'auth.logged_out');
    }
}
