<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\UpdateProfileRequest;
use App\Http\Resources\User\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

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

        if (isset($data['avatar']) && $data['avatar'] instanceof UploadedFile) {
            unset($data['avatar']);
        }

        if (array_key_exists('avatar', $data) && $data['avatar'] === null) {
            if ($user->avatar) {
                Storage::disk(config('filesystems.media_disk'))->delete($user->avatar);
            }
        }

        $this->storeImage($request, 'avatar', self::AVATAR_STORAGE_PATH, $data, $user);
        $user->update($data);
        $user = $user->fresh();

        return $this->success(new UserResource($user), 'Profile updated.');
    }
}
