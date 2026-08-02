<?php

namespace App\Http\Controllers\User;

use App\Events\UserFollowed;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\User\SuggestedUserResource;
use App\Http\Resources\User\UserMentionResource;
use App\Models\User;
use App\Models\UserFollow;
use App\Services\User\UserSuggestionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Follow/unfollow users, and search users to follow or @mention.
 */
class UserFollowController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly UserSuggestionService $suggestionService,
    ) {}

    /**
     * Ranked "Suggested for you" candidates for the Explore feed widget.
     *
     * Query params:
     *   limit — default 20, max 20
     */
    public function suggestions(Request $request): JsonResponse
    {
        $limit = (int) $request->query('limit', UserSuggestionService::DEFAULT_LIMIT);

        $users = $this->suggestionService->forViewer($request->user(), $limit);

        return $this->success(SuggestedUserResource::collection($users));
    }

    /**
     * Search app users for @mention autocomplete — users the viewer follows rank first.
     * Empty "q" is allowed on purpose: typing "@" alone shows people you follow, TikTok-style.
     *
     * Only users with a nickname are returned (mentions are always @nickname).
     * Matches name/nickname only — never email or phone.
     */
    public function search(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));
        if (mb_strlen($q) > 50) {
            $q = mb_substr($q, 0, 50);
        }
        // Strip characters that cannot appear in a handle so LIKE stays predictable.
        $q = preg_replace('/[^\p{L}\p{N}_\s]/u', '', $q) ?? '';

        $viewer = $request->user();
        $limit = 20;
        $columns = User::SOCIAL_SUMMARY_COLUMNS;

        $followedIds = UserFollow::query()
            ->where('follower_id', $viewer->id)
            ->pluck('followed_user_id');

        $matching = function () use ($q, $viewer) {
            $query = User::query()
                ->appUsers()
                ->active()
                ->where('id', '!=', $viewer->id)
                ->whereNotNull('nickname')
                ->where('nickname', '!=', '');

            if ($q !== '') {
                $safe = '%'.addcslashes(mb_strtolower($q), '%_\\').'%';
                $query->where(function ($inner) use ($safe) {
                    $inner->whereRaw('LOWER(name) LIKE ?', [$safe])
                        ->orWhereRaw('LOWER(nickname) LIKE ?', [$safe]);
                });
            }

            return $query;
        };

        $followed = $matching()
            ->whereIn('id', $followedIds)
            ->orderBy('name')
            ->limit($limit)
            ->get($columns);

        $others = collect();
        if ($followed->count() < $limit) {
            $others = $matching()
                ->whereNotIn('id', $followedIds)
                ->orderBy('name')
                ->limit($limit - $followed->count())
                ->get($columns);
        }

        return $this->success(UserMentionResource::collection($followed->concat($others)));
    }

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
                $follower->increment('following_count');
            });

            event(new UserFollowed($follower, $user));
        }

        $user->refresh();
        $follower->refresh();

        return $this->success([
            'followers_count' => (int) $user->followers_count,
            'following_count' => (int) $follower->following_count,
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
            DB::transaction(function () use ($follow, $user, $follower) {
                $follow->delete();
                if ($user->followers_count > 0) {
                    $user->decrement('followers_count');
                }
                if ($follower->following_count > 0) {
                    $follower->decrement('following_count');
                }
            });
        }

        $user->refresh();
        $follower->refresh();

        return $this->success([
            'followers_count' => (int) $user->followers_count,
            'following_count' => (int) $follower->following_count,
            'am_following' => false,
        ]);
    }
}
