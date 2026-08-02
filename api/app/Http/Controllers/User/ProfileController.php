<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\UpdateProfileRequest;
use App\Http\Resources\User\UserResource;
use App\Services\User\AppAccountDeletionService;
use App\Support\Media\MediaDisk;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    use BaseControllerTrait;

    private const AVATAR_STORAGE_PATH = 'profiles/avatars';

    /**
     * Update the authenticated user's profile.
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        if (array_key_exists('avatar', $data) && $data['avatar'] === null) {
            MediaDisk::delete($user->getRawOriginal('avatar'));
        }

        $this->storeImage($request, 'avatar', self::AVATAR_STORAGE_PATH, $data, $user);
        $user->update($data);
        $user = $user->fresh();

        return $this->success(new UserResource($user), 'Profile updated.');
    }

    /**
     * Close the app account (revoke tokens, set status blocked, soft delete).
     */
    public function destroy(Request $request, AppAccountDeletionService $deletion): JsonResponse
    {
        $user = $request->user();

        if (! $user->isUser()) {
            return $this->forbidden('This account cannot be deleted from the app.');
        }

        if ($user->trashed()) {
            return $this->failure('Account already deleted.', 'GONE');
        }

        $deletion->deleteAppUser($user);

        return $this->success(null, 'Your account has been deleted.');
    }
}
