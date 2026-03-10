<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserFollow;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

/**
 * Follow/unfollow users (user-only, no reels).
 */
class UserFollowController extends Controller
{
    use BaseControllerTrait;

    public function follow(User $user): JsonResponse
    {
        $follower = request()->user();

        if ($follower->id === $user->id) {
            return $this->failure('Cannot follow yourself.', 'VALIDATION_ERROR');
        }

        $exists = UserFollow::query()
            ->where('follower_id', $follower->id)
            ->where('followed_user_id', $user->id)
            ->exists();

        if (! $exists) {
            DB::transaction(function () use ($user, $follower) {
                UserFollow::create([
                    'follower_id' => $follower->id,
                    'followed_user_id' => $user->id,
                ]);
                $user->increment('followers_count');
            });
        }

        $user->refresh();

        return $this->success([
            'followers_count' => (int) $user->followers_count,
            'am_following' => true,
        ]);
    }

    public function unfollow(User $user): JsonResponse
    {
        $follower = request()->user();

        $follow = UserFollow::query()
            ->where('follower_id', $follower->id)
            ->where('followed_user_id', $user->id)
            ->first();

        if ($follow) {
            DB::transaction(function () use ($follow, $user) {
                $follow->delete();
                $user->decrement('followers_count');
            });
        }

        $user->refresh();

        return $this->success([
            'followers_count' => (int) $user->followers_count,
            'am_following' => false,
        ]);
    }
}
