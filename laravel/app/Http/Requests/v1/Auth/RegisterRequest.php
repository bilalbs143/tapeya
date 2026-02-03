<?php

namespace App\Http\Requests\v1\Auth;

use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Events\Auth\UserRegistered;
use App\Http\Resources\v1\Auth\LoginResource;
use App\Models\User;
use Exception;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'username' => ['required', 'string', 'max:100', 'regex:/^[a-z0-9]+$/', Rule::unique('users')],
            'name' => 'required|max:100',
            'nickname' => 'required|max:100',
            'password' => ['required', 'confirmed', Password::defaults()],
            'password_confirmation' => ['required'],
            'dob' => 'sometimes|date',
            'phone' => ['required', Rule::unique('users')],
            'referal_code' => ['sometimes', Rule::exists('users', 'ref_code')->withoutTrashed()],
            'bank_id' => ['required', Rule::exists('banks', 'id')->withoutTrashed()],
            'account_number' => ['required', Rule::unique('user_banks', 'account_number')->withoutTrashed()],
            'account_holder' => 'required',
        ];
    }

    public function register(): array
    {
        $data = $this->validated();
        $data['type'] = UserTypeEnum::USER;

        if ($data['referal_code']) {
            $referrer = User::active()->where('ref_code', $data['referal_code'])->first();

            if (! $referrer) {
                throw new Exception('Invalid referrer');
            }

            // Check if referrer is an agent or user
            if ($referrer->isAgent()) {
                // Agent referral - assign as parent
                $data['parent_id'] = $referrer->id;
            } elseif ($referrer->isMember()) {
                // User referral - assign as referred_by
                $data['referred_by'] = $referrer->id;
                // For user referrals, we still need to find the agent parent
                // Use the referring user's parent_id if they have one
                if ($referrer->parent_id) {
                    $data['parent_id'] = $referrer->parent_id;
                }
            } else {
                throw new Exception('Invalid referrer');
            }
        } else {
            // No referral code provided - assign to default NoReferral agent
            $noReferralAgent = User::active()->agent()->where('username', '----')->firstOrFail();
            $data['parent_id'] = $noReferralAgent->id;
        }

        $user = User::create($data);
        // auth()->login($user);
        $user->createBank($data);

        // Attempt auto-approval if member has unique credentials
        $user->autoApprove();

        UserRegistered::dispatch($user);

        $user = User::with('bank_account')->findOrFail($user->id);
        if ($user->status === UserStatusEnum::PENDING) {
            return ['user' => new LoginResource($user)];
        } else {
            return $user->loginResponse();
        }
    }

    public function attributes(): array
    {
        return [
            'username' => 'ID',
        ];
    }
}
