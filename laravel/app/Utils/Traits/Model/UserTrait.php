<?php

namespace App\Utils\Traits\Model;

use App\Builders\UserBuilder;
use App\Enums\Role\PermissionsEnum;
use App\Enums\Role\RolesEnum;
use App\Enums\User\UserDomainTypeEnum;
use App\Enums\User\UserLocaleEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Http\Resources\v1\User\AdminResource;
use App\Http\Resources\v1\User\AgentResource;
use App\Http\Resources\v1\User\LimitedAgentResource;
use App\Http\Resources\v1\User\LimitedMemberResource;
use App\Http\Resources\v1\User\MemberResource;
use App\Models\AuthenticationLog;
use App\Models\MembershipCommissionSetting;
use App\Models\Permission;
use App\Models\UserBank;
use App\Utils\Services\ResponseService;
use App\Utils\Services\SystemSettingsService;
use Illuminate\Database\Eloquent\Casts\Attribute;

trait UserTrait
{
    public function newEloquentBuilder($query): UserBuilder
    {
        return new UserBuilder($query);
    }

    // for notifications
    public function preferredLocale(): string
    {
        if (env('APP_ENV') === 'local') {
            return UserLocaleEnum::en->value;
        }

        return $this->locale;
    }

    public function role()
    {
        return $this->roles()?->first()?->name;
    }

    public function createAuthToken()
    {
        $accessToken = $this->createToken('authToken');

        // Update authentication log if it exists (may not exist during registration)
        $lastLogin = $this->last_login();
        if ($lastLogin) {
            $lastLogin->update([
                'oauth_access_token_id' => $accessToken->accessToken->id,
                'origin' => request()->headers->get('origin'),
            ]);
        }

        return $accessToken;
    }

    public function last_login()
    {
        return $this->authentications()->first();
    }

    public function loginResponse($token = null)
    {
        return ResponseService::loginResponse($this, $token);
    }

    public function getIsAdminAttribute()
    {
        return $this->isAdmin();
    }

    public function isAdmin()
    {
        return $this->hasRole(RolesEnum::SUPER_ADMIN) || $this->hasRole(RolesEnum::ADMIN);
    }

    public function isAgent()
    {
        return $this->type === UserTypeEnum::AGENT || $this->hasRole(RolesEnum::AGENT);
    }

    public function isMember()
    {
        return $this->type === UserTypeEnum::USER || $this->hasRole(RolesEnum::USER);
    }

    public function getResource()
    {
        if ($this->isMember()) {
            $resource = new MemberResource($this);
        }
        if ($this->isAgent()) {
            $resource = new AgentResource($this);
        }
        if ($this->isAdmin()) {
            $resource = new AdminResource($this);
        }

        return $resource ?? new MemberResource($this);
    }

    public function getLimitedResource()
    {
        if ($this->isMember()) {
            $resource = new LimitedMemberResource($this);
        }
        if ($this->isAgent()) {
            $resource = new LimitedAgentResource($this);
        }
        if ($this->isAdmin()) {
            $resource = new AdminResource($this);
        }

        return $resource ?? new LimitedMemberResource($this);
    }

    public function canAccessBackOffice()
    {
        return $this->isAdmin() || $this->isAgent();
    }

    public function createBank(array $data)
    {
        if (isset($data['bank_id']) && isset($data['account_number']) && isset($data['account_holder'])) {
            return UserBank::create([
                'user_id' => $this->id,
                'bank_id' => $data['bank_id'],
                'account_number' => $data['account_number'],
                'account_holder' => $data['account_holder'],
            ]);
        }

        return null;
    }

    public function updateBank(array $data)
    {
        $bank = $this->bank_account;

        if ($bank) {
            $bank->update([
                'bank_id' => $data['bank_id'] ?? $bank->bank_id,
                'account_number' => $data['account_number'] ?? $bank->account_number,
                'account_holder' => $data['account_holder'] ?? $bank->account_holder,
            ]);

            return $bank;
        } else {
            return $this->createBank($data);
        }
    }

    public function createOrUpdateDomainData(UserDomainTypeEnum $type, array $data)
    {
        $this->domains()->where('type', $type)->forceDelete();

        foreach ($data as $domain) {
            $this->domains()->create([
                'type' => $type,
                'data' => $domain,
            ]);
        }
    }

    public function createDomains(array $data)
    {
        if (isset($data['domains'])) {
            $this->createOrUpdateDomainData(UserDomainTypeEnum::DOMAIN, $data['domains'] ?? []);
        }

        if (isset($data['telegrams'])) {
            $this->createOrUpdateDomainData(UserDomainTypeEnum::TELEGRAM, $data['telegrams'] ?? []);
        }

        if (isset($data['kakao_talks'])) {
            $this->createOrUpdateDomainData(UserDomainTypeEnum::KAKAO_TALK, $data['kakao_talks'] ?? []);
        }
    }

    public function scopeActiveTokens()
    {
        return $this->tokens()->get();
    }

    public function revokeAllTokens()
    {
        $tokenIds = [];
        $this->activeTokens()->each(function ($token) use (&$tokenIds) {
            $tokenIds[] = $token->id;
            $token->delete();
        });

        AuthenticationLog::where('authenticatable_id', $this->id)->whereIn('oauth_access_token_id', $tokenIds)->update(['logout_at' => now()]);
    }

    public function logout()
    {
        $user = request()->user();
        $currentToken = $user->currentAccessToken();

        if ($currentToken) {
            AuthenticationLog::where('authenticatable_id', $this->id)
                ->where('oauth_access_token_id', $currentToken->id)
                ->update(['logout_at' => now()]);

            // Delete the token from the database
            $user->tokens()->where('id', $currentToken->id)->delete();
        }

        return true;
    }

    public function levelConfig()
    {
        return MembershipCommissionSetting::whereLevel($this->level)->first();
    }

    public function scopeFilterByAgent($q)
    {
        $q->when(request('agent_id'), function ($query) {
            $agent = self::agent()->with('grand_children:id,parent_id')->find(request('agent_id'));
            if ($agent) {
                $query->whereIn('id', $agent->allMemberIds());
            } else {
                $query->whereRaw('1 = 0');
            }
        });
    }

    public function firstName(): Attribute
    {
        return Attribute::make(
            get: function () {
                $nameParts = explode(' ', $this->name);

                return $nameParts[0];
            }
        );
    }

    public function lastName(): Attribute
    {
        return Attribute::make(
            get: function () {
                $nameParts = explode(' ', $this->name);

                return $nameParts[1] ?? '';
            }
        );
    }

    public function holdingMoney(): Attribute
    {
        return Attribute::make(
            get: function () {
                return (float) $this->wallet?->holding_money ?: 0;
            }
        );
    }

    public function getPermissions()
    {
        $permissions = [];

        if ($this->canAccessBackOffice()) {
            $permissions = $this->isAdmin() ? Permission::whereNotIn('name', [
                PermissionsEnum::WITHDRAW_LOSING_MONEY,
                PermissionsEnum::WITHDRAW_ROLLING_MONEY,
            ])->get() : $this->getAllPermissions();
            $permissions = $permissions->map(fn ($permission) => $permission->name);
        }

        return $permissions;
    }

    /**
     * Check if the user has unique credentials (username, phone, and bank account).
     * Used for auto-approval eligibility.
     */
    public function hasUniqueCredentials(): bool
    {
        // Check if username is unique (excluding current user)
        $usernameExists = self::where('username', $this->username)
            ->where('id', '!=', $this->id)
            ->exists();

        if ($usernameExists) {
            return false;
        }

        // Check if phone is unique (excluding current user)
        if ($this->phone) {
            $phoneExists = self::where('phone', $this->phone)
                ->where('id', '!=', $this->id)
                ->exists();

            if ($phoneExists) {
                return false;
            }
        }

        // Check if bank account number is globally unique (across all banks)
        if ($this->bank_account) {
            $bankAccountExists = UserBank::where('account_number', $this->bank_account->account_number)
                ->where('user_id', '!=', $this->id)
                ->exists();

            if ($bankAccountExists) {
                return false;
            }
        } else {
            // If no bank account exists, cannot auto-approve
            return false;
        }

        return true;
    }

    /**
     * Auto-approve the member if all conditions are met.
     * Uses system user for approval.
     *
     * @return bool Returns true if auto-approved, false otherwise
     */
    public function autoApprove(): bool
    {
        // Only auto-approve members
        if (! $this->isMember()) {
            return false;
        }

        // Check if auto-approval is enabled
        if (! SystemSettingsService::isMemberAutoApprovalEnabled()) {
            return false;
        }

        // Check if already approved or rejected
        if (! is_null($this->approved_at) || ! is_null($this->rejected_at)) {
            return false;
        }

        // Check if user has unique credentials
        if (! $this->hasUniqueCredentials()) {
            return false;
        }

        // Get system user for approval
        $systemUser = SystemSettingsService::getSystemUser();

        if (! $systemUser) {
            return false;
        }

        // Auto-approve by directly setting all approval fields
        // This bypasses the observer's status change logic and sets everything at once
        $this->forceFill([
            'status' => UserStatusEnum::ACTIVE,
            'approved_at' => now(),
            'approved_by' => $systemUser->id,
            'blocked_at' => null,
            'blocked_by' => null,
        ]);

        return $this->save();
    }
}
