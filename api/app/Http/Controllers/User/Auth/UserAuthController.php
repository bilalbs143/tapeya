<?php

namespace App\Http\Controllers\User\Auth;

use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Events\UserRegistered;
use App\Exceptions\OtpSmsDeliveryException;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\Auth\RegisterRequest;
use App\Http\Requests\User\Auth\RequestOtpRequest;
use App\Http\Requests\User\Auth\VerifyOtpRequest;
use App\Http\Resources\User\UserResource;
use App\Models\User;
use App\Utils\Services\OtpService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * User (app) auth: phone + OTP only. No password.
 *
 * Register: POST /register (name, nickname, phone) → create user, send OTP → user must verify.
 * Login:    POST /request-otp (phone) → send OTP → POST /verify-otp (phone, code) → token.
 * Both flows complete with the same verify-otp step (activates account and returns token).
 *
 * When APP_DEBUG is true, OTP is not sent by SMS; the code is only included in the JSON response.
 * When the SMS driver is `log`, the code is also included in the JSON response (regardless of APP_DEBUG).
 * Numbers listed in system setting `test_otp_phones` never use the SMS OTP service; the OTP is only in the JSON (same as debug).
 */
class UserAuthController extends Controller
{
    public function __construct(
        protected OtpService $otpService
    ) {}

    /**
     * Register: name, nickname, phone (with country code). Creates user (VERIFICATION_PENDING), sends OTP.
     * User must then call verify-otp with the code to activate and get token.
     *
     * Walk-ups already exist as verification_pending users — they activate via login OTP
     * (request-otp → verify-otp), not via register. Unique phone still rejects that path.
     */
    public function register(RegisterRequest $request)
    {
        $data = $request->validated();

        $user = DB::transaction(function () use ($data) {
            return User::create([
                'name' => $data['name'],
                'nickname' => $data['nickname'],
                'phone' => $data['phone'],
                'password' => null,
                'type' => UserTypeEnum::USER,
                'status' => UserStatusEnum::VERIFICATION_PENDING,
            ]);
        });

        event(new UserRegistered($user));

        $this->sendOtpHandlingTestPhoneSmsFailure($user);

        $payload = ['user' => new UserResource($user)];
        $otp = $this->otpService->getCurrentOtp($user->phone);
        if ($otp !== null) {
            $payload['otp'] = $otp;
        }

        return response()->success($payload, 'auth.otp_sent', 'SUCCESS');
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

        $this->sendOtpHandlingTestPhoneSmsFailure($user);

        $otp = $this->otpService->getCurrentOtp($phone);
        $data = $otp !== null ? ['otp' => $otp] : null;

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
            return response()->failure('Invalid OTP.', 'UNAUTHORIZED');
        }

        $user = User::query()
            ->where('phone', $phone)
            ->where('type', UserTypeEnum::USER)
            ->firstOrFail();

        if ($user->isBlocked()) {
            return response()->failure('Account is blocked.', 'FORBIDDEN');
        }

        $user->update([
            'status' => UserStatusEnum::ACTIVE,
            'last_active_at' => now(),
        ]);
        $user = $user->fresh();

        $token = $user->createToken('app')->plainTextToken;

        $data = [
            'user' => UserResource::self($user),
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
        $user = request()->user()?->fresh();
        if (! $user) {
            return response()->failure('Unauthenticated.', 'UNAUTHORIZED');
        }

        return response()->success(UserResource::self($user));
    }

    public function logout()
    {
        request()->user()->currentAccessToken()?->delete();

        return response()->success(message: 'auth.logged_out');
    }

    /**
     * Send OTP SMS unless APP_DEBUG or test phone. For TEST_OTP_PHONES, OTP is always stored; if SMS fails, still allow JSON OTP for QA.
     */
    private function sendOtpHandlingTestPhoneSmsFailure(User $user): void
    {
        try {
            $this->otpService->sendToUser($user);
        } catch (OtpSmsDeliveryException $e) {
            if (! $this->otpService->isTestOtpPhone($user->phone)) {
                throw $e;
            }

            Log::warning('OTP SMS failed for TEST_OTP_PHONES number; returning OTP in API only.', [
                'user_id' => $user->id,
                'phone' => OtpService::normalizePhone($user->phone),
                'exception' => $e::class,
                'message' => $e->getMessage(),
            ]);
        }
    }
}
