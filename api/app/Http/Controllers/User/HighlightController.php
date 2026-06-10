<?php

namespace App\Http\Controllers\User;

use App\Enums\Tournament\ReactionEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\User\HighlightResource;
use App\Models\Highlight;
use App\Models\HighlightUserReaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Spatie\QueryBuilder\QueryBuilder;

class HighlightController extends Controller
{
    use BaseControllerTrait;

    /**
     * List active highlights.
     *
     * Query params:
     *   filter[title]      — partial title search
     *   filter[tournament_id] — filter by tournament
     *   sort               — created_at | -created_at (default) | views_count | -views_count
     *   per_page           — items per page (default 15)
     *
     * The app home-screen slider and "Most Recent" / "Most Viewed" sections both
     * use this endpoint with different sort values.
     */
    public function index(): JsonResponse
    {
        $query = QueryBuilder::for(Highlight::class)
            ->allowedFilters(Highlight::getFilters())
            ->allowedSorts(Highlight::getSorts())
            ->defaultSort('-created_at')
            ->where('is_active', true);

        return $this->success(HighlightResource::collection($this->paginateOrAll($query)));
    }

    /**
     * Show a single highlight and increment its view counter.
     *
     * Also appends `my_reaction` if the request is authenticated.
     */
    public function show(Request $request, Highlight $highlight): JsonResponse
    {
        if (! $highlight->is_active) {
            return $this->notFound('Highlight not found.');
        }

        // Increment view count (non-blocking — ignore race conditions, it's a counter)
        $highlight->increment('views_count');

        // Attach authenticated user's reaction if available
        $user = $request->user();
        if ($user) {
            $myReaction = HighlightUserReaction::query()
                ->where('highlight_id', $highlight->id)
                ->where('user_id', $user->id)
                ->value('reaction');

            $highlight->setAttribute('my_reaction', $myReaction);
        }

        return $this->success(new HighlightResource($highlight));
    }

    /**
     * Like a highlight (one reaction per user — switches from dislike if previously set).
     */
    public function like(Highlight $highlight): JsonResponse
    {
        return $this->upsertReaction($highlight, ReactionEnum::LIKE);
    }

    /**
     * Dislike a highlight (one reaction per user — switches from like if previously set).
     */
    public function dislike(Highlight $highlight): JsonResponse
    {
        return $this->upsertReaction($highlight, ReactionEnum::DISLIKE);
    }

    /**
     * Record a share (increments shares_count).
     */
    public function share(Highlight $highlight): JsonResponse
    {
        if (! $highlight->is_active) {
            return $this->notFound('Highlight not found.');
        }

        $highlight->increment('shares_count');

        $highlight = $highlight->fresh();

        return $this->success([
            'likes_count' => (int) $highlight->likes_count,
            'dislikes_count' => (int) $highlight->dislikes_count,
            'shares_count' => (int) $highlight->shares_count,
        ]);
    }

    // ── Private ───────────────────────────────────────────────────────────────

    private function upsertReaction(Highlight $highlight, ReactionEnum $reaction): JsonResponse
    {
        if (! $highlight->is_active) {
            return $this->notFound('Highlight not found.');
        }

        $user = request()->user();

        $existing = HighlightUserReaction::query()
            ->where('highlight_id', $highlight->id)
            ->where('user_id', $user->id)
            ->first();

        DB::transaction(function () use ($highlight, $user, $reaction, $existing) {
            if ($existing) {
                if ($existing->reaction === $reaction) {
                    return; // Same reaction — no change needed
                }
                $existing->update(['reaction' => $reaction]);
            } else {
                HighlightUserReaction::create([
                    'highlight_id' => $highlight->id,
                    'user_id' => $user->id,
                    'reaction' => $reaction,
                ]);
            }

            $highlight->update([
                'likes_count' => HighlightUserReaction::query()
                    ->where('highlight_id', $highlight->id)
                    ->where('reaction', ReactionEnum::LIKE)
                    ->count(),
                'dislikes_count' => HighlightUserReaction::query()
                    ->where('highlight_id', $highlight->id)
                    ->where('reaction', ReactionEnum::DISLIKE)
                    ->count(),
            ]);
        });

        $highlight->refresh();
        $myReaction = HighlightUserReaction::query()
            ->where('highlight_id', $highlight->id)
            ->where('user_id', $user->id)
            ->value('reaction');

        return $this->success([
            'likes_count' => (int) $highlight->likes_count,
            'dislikes_count' => (int) $highlight->dislikes_count,
            'shares_count' => (int) $highlight->shares_count,
            'my_reaction' => $myReaction,
        ]);
    }
}
