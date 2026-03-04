<?php

namespace App\Http\Controllers\User;

use App\Enums\Tournament\ReactionEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Models\Tournament;
use App\Models\TournamentUserReaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class TournamentReactionController extends Controller
{
    use BaseControllerTrait;

    /**
     * Set the current user's reaction to like (one reaction per user per tournament).
     * If they had dislike, it is switched to like.
     */
    public function like(Tournament $tournament): JsonResponse
    {
        return $this->upsertReaction($tournament, ReactionEnum::LIKE);
    }

    /**
     * Set the current user's reaction to dislike (one reaction per user per tournament).
     * If they had like, it is switched to dislike.
     */
    public function dislike(Tournament $tournament): JsonResponse
    {
        return $this->upsertReaction($tournament, ReactionEnum::DISLIKE);
    }

    private function upsertReaction(Tournament $tournament, ReactionEnum $reaction): JsonResponse
    {
        $user = request()->user();

        $reactionRow = TournamentUserReaction::query()
            ->where('tournament_id', $tournament->id)
            ->where('user_id', $user->id)
            ->first();

        DB::transaction(function () use ($tournament, $user, $reaction, $reactionRow) {
            if ($reactionRow) {
                if ($reactionRow->reaction === $reaction) {
                    return; // already this reaction, no change
                }
                $reactionRow->update(['reaction' => $reaction]);
            } else {
                TournamentUserReaction::create([
                    'user_id' => $user->id,
                    'tournament_id' => $tournament->id,
                    'reaction' => $reaction,
                ]);
            }

            $likesCount = TournamentUserReaction::query()
                ->where('tournament_id', $tournament->id)
                ->where('reaction', ReactionEnum::LIKE)
                ->count();
            $dislikesCount = TournamentUserReaction::query()
                ->where('tournament_id', $tournament->id)
                ->where('reaction', ReactionEnum::DISLIKE)
                ->count();

            $tournament->update([
                'likes_count' => $likesCount,
                'dislikes_count' => $dislikesCount,
            ]);
        });

        $tournament->refresh();
        $myReaction = TournamentUserReaction::query()
            ->where('tournament_id', $tournament->id)
            ->where('user_id', $user->id)
            ->value('reaction');

        return $this->success([
            'likes_count' => (int) $tournament->likes_count,
            'dislikes_count' => (int) $tournament->dislikes_count,
            'shares_count' => (int) $tournament->shares_count,
            'my_reaction' => $myReaction,
        ]);
    }

    /**
     * Record a share on the tournament (increments shares_count).
     */
    public function share(Tournament $tournament): JsonResponse
    {
        $tournament->increment('shares_count');

        return $this->success([
            'likes_count' => (int) $tournament->fresh()->likes_count,
            'dislikes_count' => (int) $tournament->fresh()->dislikes_count,
            'shares_count' => (int) $tournament->fresh()->shares_count,
        ]);
    }
}
