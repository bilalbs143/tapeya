<?php

namespace App\Services\User;

use App\Enums\User\UserStatusEnum;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AppAccountDeletionService
{
    /**
     * Soft-delete an app (customer) user: revoke API tokens, then mark fields deleted and soft-delete the row.
     *
     * Call only for {@see User::isUser()} accounts. The HTTP layer must enforce that.
     */
    public function deleteAppUser(User $user): void
    {
        if ($user->trashed()) {
            return;
        }

        DB::transaction(function () use ($user) {
            $user->tokens()->delete();

            $deletedSuffix = '_deleted_id_'.$user->id;

            $user->forceFill([
                'name' => ($user->name ?? '').$deletedSuffix,
                'nickname' => ($user->nickname ?? '').$deletedSuffix,
                'email' => filled($user->email)
                    ? $user->email.$deletedSuffix
                    : 'deleted-'.$user->id.'@tapeya.invalid',
                'phone' => ($user->phone ?? '').$deletedSuffix,
                'status' => UserStatusEnum::BLOCKED,
            ])->save();

            $user->delete();
        });
    }
}
