<?php

namespace App\Http\Controllers\User;

use App\Enums\Tournament\ReactionEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\User\DramaEpisodeResource;
use App\Models\DramaEpisode;
use App\Models\DramaEpisodeUserReaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DramaEpisodeController extends Controller
{
    use BaseControllerTrait;

    public function show(Request $request, DramaEpisode $drama_episode): JsonResponse
    {
        $drama_episode->loadMissing('serial');

        if (! $drama_episode->is_active || ! ($drama_episode->serial?->is_active ?? false)) {
            return $this->notFound('Episode not found.');
        }

        $drama_episode->increment('views_count');

        $user = $request->user();
        if ($user) {
            $myReaction = DramaEpisodeUserReaction::query()
                ->where('drama_episode_id', $drama_episode->id)
                ->where('user_id', $user->id)
                ->value('reaction');
            $drama_episode->setAttribute('my_reaction', $myReaction);
        }

        $siblings = DramaEpisode::query()
            ->where('drama_serial_id', $drama_episode->drama_serial_id)
            ->where('is_active', true)
            ->orderBy('episode_number')
            ->get(['id', 'episode_number']);

        $prev = null;
        $next = null;
        foreach ($siblings as $index => $row) {
            if ((int) $row->id === (int) $drama_episode->id) {
                $prev = $index > 0 ? $siblings[$index - 1]->id : null;
                $next = $index < $siblings->count() - 1 ? $siblings[$index + 1]->id : null;
                break;
            }
        }

        $drama_episode->setAttribute('prev_episode_id', $prev);
        $drama_episode->setAttribute('next_episode_id', $next);

        return $this->success(new DramaEpisodeResource($drama_episode));
    }

    public function like(DramaEpisode $drama_episode): JsonResponse
    {
        return $this->upsertReaction($drama_episode, ReactionEnum::LIKE);
    }

    public function dislike(DramaEpisode $drama_episode): JsonResponse
    {
        return $this->upsertReaction($drama_episode, ReactionEnum::DISLIKE);
    }

    public function share(DramaEpisode $drama_episode): JsonResponse
    {
        if (! $drama_episode->is_active) {
            return $this->notFound('Episode not found.');
        }

        $drama_episode->increment('shares_count');
        $drama_episode = $drama_episode->fresh();

        return $this->success([
            'likes_count' => (int) $drama_episode->likes_count,
            'dislikes_count' => (int) $drama_episode->dislikes_count,
            'shares_count' => (int) $drama_episode->shares_count,
            'comments_count' => (int) $drama_episode->comments_count,
        ]);
    }

    private function upsertReaction(DramaEpisode $drama_episode, ReactionEnum $reaction): JsonResponse
    {
        if (! $drama_episode->is_active) {
            return $this->notFound('Episode not found.');
        }

        $user = request()->user();

        $existing = DramaEpisodeUserReaction::query()
            ->where('drama_episode_id', $drama_episode->id)
            ->where('user_id', $user->id)
            ->first();

        DB::transaction(function () use ($drama_episode, $user, $reaction, $existing) {
            if ($existing) {
                if ($existing->reaction === $reaction) {
                    return;
                }
                $existing->update(['reaction' => $reaction]);
            } else {
                DramaEpisodeUserReaction::query()->create([
                    'drama_episode_id' => $drama_episode->id,
                    'user_id' => $user->id,
                    'reaction' => $reaction,
                ]);
            }

            $drama_episode->update([
                'likes_count' => DramaEpisodeUserReaction::query()
                    ->where('drama_episode_id', $drama_episode->id)
                    ->where('reaction', ReactionEnum::LIKE)
                    ->count(),
                'dislikes_count' => DramaEpisodeUserReaction::query()
                    ->where('drama_episode_id', $drama_episode->id)
                    ->where('reaction', ReactionEnum::DISLIKE)
                    ->count(),
            ]);
        });

        $drama_episode->refresh();
        $myReaction = DramaEpisodeUserReaction::query()
            ->where('drama_episode_id', $drama_episode->id)
            ->where('user_id', $user->id)
            ->value('reaction');

        return $this->success([
            'likes_count' => (int) $drama_episode->likes_count,
            'dislikes_count' => (int) $drama_episode->dislikes_count,
            'shares_count' => (int) $drama_episode->shares_count,
            'comments_count' => (int) $drama_episode->comments_count,
            'my_reaction' => $myReaction instanceof ReactionEnum ? $myReaction->value : $myReaction,
        ]);
    }
}
