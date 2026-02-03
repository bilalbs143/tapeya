<?php

namespace App\Observers;

use App\Enums\Role\RolesEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\User;
use App\Utils\Services\RolesService;
use App\Utils\Services\SystemSettingsService;
use App\Utils\Services\Utils;
use Illuminate\Support\Facades\Auth;

class UserObserver
{
    /**
     * Handle the User "saving" event.
     *
     * @return void
     */
    public function saving(User $user) {}

    /**
     * Handle the User "saved" event.
     * Check for auto-approval after user and bank account are created.
     *
     * @return void
     */
    public function saved(User $user)
    {
        // Auto-approve member if conditions are met
        // This runs after user is saved, and bank account should be available
        if ($user->isMember() && $user->status === UserStatusEnum::PENDING) {
            // Reload bank_account relationship to ensure it's available
            $user->load('bank_account');

            // Attempt auto-approval
            $user->autoApprove();
        }
    }

    /**
     * Handle the User "creating" event.
     *
     * @return void
     */
    public function creating(User $user)
    {
        $user->created_at_ip = Utils::getClientIp();
        if (SystemSettingsService::isUserAutoActive()) {
            if (! $user->isMember()) {
                $user->status = UserStatusEnum::ACTIVE;
                $user->approved_at = now();
            }
        }

        if (! $user->isDirty('currency')) {
            $user->currency = SystemSettingsService::getDefaultCurrency();
        }

        if ($user->isMember() && empty($user->ref_code)) {
            $user->ref_code = Utils::generateUniqueRefCode();
        }
    }

    /**
     * Handle the User "created" event.
     *
     * @return void
     */
    public function created(User $user)
    {
        if ($user->isAgent()) {
            RolesService::assignRole($user, RolesEnum::AGENT);
        }
        if ($user->isMember()) {
            RolesService::assignRole($user, RolesEnum::USER);
        }
        if ($user->type === UserTypeEnum::ADMINISTRATOR) {
            RolesService::assignRole($user, RolesEnum::ADMIN);
        }

        if ($user->isAgent() || $user->isMember()) {
            $user->wallet()->create();
        }
    }

    /**
     * Handle the User "updating" event.
     *
     * @return void
     */
    public function updating(User $user)
    {
        if ($user->isDirty('status')) {
            if ($user->status === UserStatusEnum::BLOCK) {
                $user->forceFill(['blocked_at' => now(), 'blocked_by' => Auth::id()]);
            }
            if ($user->status === UserStatusEnum::ACTIVE) {
                $user->forceFill(['blocked_at' => null, 'blocked_by' => null]);
            }

            // if user has not been already approved or rejected
            if (is_null($user->approved_at) && is_null($user->rejected_at)) {
                if ($user->status === UserStatusEnum::APPROVED) {
                    $user->forceFill([
                        'approved_at' => now(),
                        'approved_by' => Auth::id(),
                        'status' => UserStatusEnum::ACTIVE,
                    ]);
                }
                if ($user->status === UserStatusEnum::REJECTED) {
                    $user->forceFill([
                        'rejected_at' => now(),
                        'rejected_by' => Auth::id(),
                        'status' => UserStatusEnum::BLOCK,
                        'blocked_at' => now(),
                        'blocked_by' => Auth::id(),
                    ]);
                }
            }

            // just to make sure if if approved status we have to set Active
            if ($user->status === UserStatusEnum::APPROVED) {
                $user->forceFill([
                    'status' => UserStatusEnum::ACTIVE,
                    'blocked_at' => null,
                    'blocked_by' => null,
                ]);
            }

            // just to make sure if if rejected status we have to set Block
            if ($user->status === UserStatusEnum::REJECTED) {
                $user->forceFill([
                    'status' => UserStatusEnum::BLOCK,
                    'blocked_at' => now(),
                    'blocked_by' => Auth::id(),
                ]);
            }
        }

        if ($user->isDirty('locale')) {
            app()->setLocale($user->locale);
        }
    }

    /**
     * Handle the User "updated" event.
     *
     * @return void
     */
    public function updated(User $user)
    {
        //
    }

    /**
     * Handle the User "deleting" event.
     *
     * @return void
     */
    public function deleting(User $user)
    {
        if ($user->isForceDeleting()) {
        }
    }

    /**
     * Handle the User "deleted" event.
     *
     * @return void
     */
    public function deleted(User $user)
    {
        //
    }

    /**
     * Handle the User "restoring" event.
     *
     * @return void
     */
    public function restoring(User $user)
    {
        //
    }

    /**
     * Handle the User "restored" event.
     *
     * @return void
     */
    public function restored(User $user)
    {
        //
    }

    /**
     * Handle the User "force deleted" event.
     *
     * @return void
     */
    public function forceDeleted(User $user)
    {
        //
    }
}
