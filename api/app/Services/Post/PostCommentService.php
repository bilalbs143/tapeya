<?php

namespace App\Services\Post;

use App\Events\PostCommented;
use App\Models\Post;
use App\Models\PostComment;
use App\Models\PostCommentMention;
use App\Models\User;
use App\Support\Post\PostMentionParser;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PostCommentService
{
    /**
     * @return LengthAwarePaginator<int, PostComment>
     */
    public function listTopLevel(Post $post, int $perPage = 20): LengthAwarePaginator
    {
        $perPage = max(1, min($perPage, 50));

        return PostComment::query()
            ->where('post_id', $post->id)
            ->whereNull('parent_id')
            ->with([User::socialSummaryWith()])
            ->withCount('replies')
            ->orderByDesc('is_pinned')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    /**
     * @return LengthAwarePaginator<int, PostComment>
     */
    public function listReplies(PostComment $parent, int $perPage = 20): LengthAwarePaginator
    {
        if ($parent->parent_id !== null) {
            throw ValidationException::withMessages([
                'parent_id' => ['Only top-level comments can have replies.'],
            ]);
        }

        $perPage = max(1, min($perPage, 50));

        return PostComment::query()
            ->where('parent_id', $parent->id)
            ->with([User::socialSummaryWith()])
            ->orderBy('created_at')
            ->orderBy('id')
            ->paginate($perPage);
    }

    public function create(Post $post, User $user, string $body, ?int $parentId = null): PostComment
    {
        $body = trim($body);
        if ($body === '') {
            throw ValidationException::withMessages([
                'body' => ['Comment cannot be empty.'],
            ]);
        }

        $comment = DB::transaction(function () use ($post, $user, $body, $parentId) {
            $parent = null;
            if ($parentId !== null) {
                $parent = PostComment::query()
                    ->where('post_id', $post->id)
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

            $created = PostComment::query()->create([
                'post_id' => $post->id,
                'user_id' => $user->id,
                'parent_id' => $parent?->id,
                'body' => $body,
            ]);

            foreach (PostMentionParser::resolveUsers($body) as $mentioned) {
                PostCommentMention::query()->firstOrCreate([
                    'comment_id' => $created->id,
                    'mentioned_user_id' => $mentioned->id,
                ]);
            }

            $post->increment('comments_count');

            return $created->load([User::socialSummaryWith()]);
        });

        event(new PostCommented($post, $comment, $user));

        return $comment;
    }

    public function delete(PostComment $comment, User $actor): void
    {
        $post = $comment->post;
        $isAuthor = $comment->user_id === $actor->id;
        $isPostOwner = $post && $post->user_id === $actor->id;

        if (! $isAuthor && ! $isPostOwner) {
            throw ValidationException::withMessages([
                'comment' => ['You cannot delete this comment.'],
            ]);
        }

        DB::transaction(function () use ($comment, $post) {
            if ($comment->parent_id === null) {
                PostComment::query()->where('parent_id', $comment->id)->delete();
            }

            $comment->delete();

            if ($post) {
                $post->forceFill([
                    'comments_count' => PostComment::query()->where('post_id', $post->id)->count(),
                ])->save();
            }
        });
    }
}
