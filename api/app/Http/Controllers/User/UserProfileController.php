<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\User\PublicUserProfileResource;
use App\Models\User;
use App\Models\UserFollow;
use App\Services\Post\PostFeedService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserProfileController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly PostFeedService $feedService,
    ) {}

    public function show(Request $request, User $user): JsonResponse
    {
        $viewer = $request->user();
        $isFollowing = false;
        if ($viewer && $viewer->id !== $user->id) {
            $isFollowing = UserFollow::query()
                ->where('follower_id', $viewer->id)
                ->where('followed_user_id', $user->id)
                ->exists();
        }

        $user->setAttribute('viewer_is_following', $isFollowing);
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
