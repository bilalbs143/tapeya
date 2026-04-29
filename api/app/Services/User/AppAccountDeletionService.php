<?php

namespace App\Services\User;

use App\Enums\User\UserStatusEnum;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AppAccountDeletionService
{
    /**
     * Soft-delete an app (customer) user: revoke API tokens, set status blocked, then soft-delete the row.
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

            $user->update([
                'status' => UserStatusEnum::BLOCKED,
            ]);

            $user->delete();
        });
    }
}
