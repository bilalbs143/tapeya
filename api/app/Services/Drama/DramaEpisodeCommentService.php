<?php

namespace App\Services\Drama;

use App\Models\DramaEpisode;
use App\Models\DramaEpisodeComment;
use App\Models\DramaEpisodeCommentLike;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DramaEpisodeCommentService
{
    /**
     * @return LengthAwarePaginator<int, DramaEpisodeComment>
     */
    public function listTopLevel(DramaEpisode $episode, int $perPage = 20): LengthAwarePaginator
    {
        $perPage = max(1, min($perPage, 50));

        return DramaEpisodeComment::query()
            ->where('drama_episode_id', $episode->id)
            ->whereNull('parent_id')
            ->with([User::socialSummaryWith()])
            ->withCount('replies')
            ->orderByDesc('is_pinned')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    /**
     * @return LengthAwarePaginator<int, DramaEpisodeComment>
     */
    public function listReplies(DramaEpisodeComment $parent, int $perPage = 20): LengthAwarePaginator
    {
        if ($parent->parent_id !== null) {
            throw ValidationException::withMessages([
                'parent_id' => ['Only top-level comments can have replies.'],
            ]);
        }

        $perPage = max(1, min($perPage, 50));

        return DramaEpisodeComment::query()
            ->where('parent_id', $parent->id)
            ->with([User::socialSummaryWith()])
            ->orderBy('created_at')
            ->orderBy('id')
            ->paginate($perPage);
    }

    public function create(DramaEpisode $episode, User $user, string $body, ?int $parentId = null): DramaEpisodeComment
    {
        $body = trim($body);
        if ($body === '') {
            throw ValidationException::withMessages([
                'body' => ['Comment cannot be empty.'],
            ]);
        }

        return DB::transaction(function () use ($episode, $user, $body, $parentId) {
            $parent = null;
            if ($parentId !== null) {
                $parent = DramaEpisodeComment::query()
                    ->where('drama_episode_id', $episode->id)
                    ->whereKey($parentId)
                    ->first();

                if (! $parent) {
                    throw ValidationException::withMessages([
                        'parent_id' => ['Parent comment not found.'],
                    ]);
                }

                if ($parent->parent_id !== null) {
                    throw ValidationException::withMessages([
                        'parent_id' => ['Replies can only be one level deep.'],
                    ]);
                }
            }

            $created = DramaEpisodeComment::query()->create([
                'drama_episode_id' => $episode->id,
                'user_id' => $user->id,
                'parent_id' => $parent?->id,
                'body' => $body,
            ]);

            $episode->increment('comments_count');

            return $created->load([User::socialSummaryWith()]);
        });
    }

    public function delete(DramaEpisodeComment $comment, User $actor): void
    {
        if ($comment->user_id !== $actor->id) {
            throw ValidationException::withMessages([
                'comment' => ['You cannot delete this comment.'],
            ]);
        }

        DB::transaction(function () use ($comment) {
            $removed = 1 + DramaEpisodeComment::query()->where('parent_id', $comment->id)->count();
            $episode = $comment->episode;
            $comment->delete();
            if ($episode) {
                $episode->decrement('comments_count', min($removed, (int) $episode->comments_count));
            }
        });
    }

    public function like(DramaEpisodeComment $comment, User $user): array
    {
        DB::transaction(function () use ($comment, $user) {
            $created = DramaEpisodeCommentLike::query()->firstOrCreate([
                'comment_id' => $comment->id,
                'user_id' => $user->id,
            ]);
            if ($created->wasRecentlyCreated) {
                $comment->increment('likes_count');
            }
        });

        $comment->refresh();

        return [
            'liked' => true,
            'likes_count' => (int) $comment->likes_count,
        ];
    }

    public function unlike(DramaEpisodeComment $comment, User $user): array
    {
        DB::transaction(function () use ($comment, $user) {
            $deleted = DramaEpisodeCommentLike::query()
                ->where('comment_id', $comment->id)
                ->where('user_id', $user->id)
                ->delete();
            if ($deleted > 0 && $comment->likes_count > 0) {
                $comment->decrement('likes_count');
            }
        });

        $comment->refresh();

        return [
            'liked' => false,
            'likes_count' => (int) $comment->likes_count,
        ];
    }

    /**
     * @param  Collection<int, DramaEpisodeComment>|array<int, DramaEpisodeComment>  $comments
     */
    public function attachViewerLiked(iterable $comments, ?User $viewer): void
    {
        if (! $viewer) {
            return;
        }

        $ids = collect($comments)->pluck('id')->filter()->all();
        if ($ids === []) {
            return;
        }

        $liked = DramaEpisodeCommentLike::query()
            ->where('user_id', $viewer->id)
            ->whereIn('comment_id', $ids)
            ->pluck('comment_id')
            ->all();

        $likedSet = array_flip($liked);
        foreach ($comments as $comment) {
            $comment->setAttribute('viewer_liked', isset($likedSet[$comment->id]));
        }
    }
}
