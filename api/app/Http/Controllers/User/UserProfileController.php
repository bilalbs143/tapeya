<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\User\PublicUserProfileResource;
use App\Models\User;
use App\Models\UserFollow;
use App\Services\Post\PostFeedService;
use App\Services\Safety\UserBlockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserProfileController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly PostFeedService $feedService,
        private readonly UserBlockService $blocks,
    ) {}

    public function show(Request $request, User $user): JsonResponse
    {
        $viewer = $request->user();
        $isFollowing = false;
        $isBlocked = false;
        if ($viewer && $viewer->id !== $user->id) {
            $isFollowing = UserFollow::query()
                ->where('follower_id', $viewer->id)
                ->where('followed_user_id', $user->id)
                ->exists();
            $isBlocked = $this->blocks->isBlocked((int) $viewer->id, (int) $user->id);
        }

        $user->setAttribute('viewer_is_following', $isFollowing);
        $user->setAttribute('viewer_has_blocked', $isBlocked);
        // Live counts match the profile Reels / Posts grids (denormalized columns can drift).
        $user->setAttribute(
            'reels_count',
            $this->feedService->countForUser((int) $user->id, $viewer?->id),
        );
        $user->setAttribute(
            'posts_count',
            $this->feedService->countPostsForUser((int) $user->id, $viewer?->id),
        );

        return $this->success(new PublicUserProfileResource($user));
    }
}
