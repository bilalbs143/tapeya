<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\Post\StorePostCommentRequest;
use App\Http\Resources\User\PostCommentResource;
use App\Models\Post;
use App\Models\PostComment;
use App\Services\Post\PostCommentService;
use App\Services\Post\PostFeedService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PostCommentController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly PostCommentService $comments,
        private readonly PostFeedService $feedService,
    ) {}

    public function index(Request $request, Post $post): JsonResponse
    {
        if ($deny = $this->guardVisible($request, $post)) {
            return $deny;
        }

        $paginator = $this->comments->listTopLevel(
            $post,
            (int) $request->query('per_page', 20),
        );

        $this->comments->attachViewerLiked($paginator->items(), $request->user());

        return $this->success([
            'items' => PostCommentResource::collection($paginator->items()),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
        ]);
    }

    public function replies(Request $request, Post $post, PostComment $comment): JsonResponse
    {
        if ($deny = $this->guardVisible($request, $post)) {
            return $deny;
        }

        if ((int) $comment->post_id !== (int) $post->id) {
            return $this->notFound('Comment not found.');
        }

        try {
            $paginator = $this->comments->listReplies(
                $comment,
                (int) $request->query('per_page', 20),
            );
        } catch (ValidationException $e) {
            return $this->failure(
                collect($e->errors())->flatten()->first() ?? 'Invalid request.',
                'VALIDATION_ERROR',
                $e->errors()
            );
        }

        $this->comments->attachViewerLiked($paginator->items(), $request->user());

        return $this->success([
            'items' => PostCommentResource::collection($paginator->items()),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
        ]);
    }

    public function store(StorePostCommentRequest $request, Post $post): JsonResponse
    {
        if ($deny = $this->guardVisible($request, $post)) {
            return $deny;
        }

        try {
            $comment = $this->comments->create(
                $post,
                $request->user(),
                $request->validated('body'),
                $request->validated('parent_id'),
            );
        } catch (ValidationException $e) {
            return $this->failure(
                collect($e->errors())->flatten()->first() ?? 'Invalid comment.',
                'VALIDATION_ERROR',
                $e->errors()
            );
        }

        $this->comments->attachViewerLiked([$comment], $request->user());

        return $this->success(new PostCommentResource($comment), 'Comment added.', 'CREATED');
    }

    public function like(Request $request, Post $post, PostComment $comment): JsonResponse
    {
        if ($deny = $this->guardVisible($request, $post)) {
            return $deny;
        }

        if ((int) $comment->post_id !== (int) $post->id) {
            return $this->notFound('Comment not found.');
        }

        return $this->success($this->comments->like($post, $comment, $request->user()));
    }

    public function unlike(Request $request, Post $post, PostComment $comment): JsonResponse
    {
        if ($deny = $this->guardVisible($request, $post)) {
            return $deny;
        }

        if ((int) $comment->post_id !== (int) $post->id) {
            return $this->notFound('Comment not found.');
        }

        return $this->success($this->comments->unlike($comment, $request->user()));
    }

    public function destroy(Request $request, Post $post, PostComment $comment): JsonResponse
    {
        if ((int) $comment->post_id !== (int) $post->id) {
            return $this->notFound('Comment not found.');
        }

        try {
            $this->comments->delete($comment, $request->user());
        } catch (ValidationException $e) {
            return $this->forbidden(
                collect($e->errors())->flatten()->first() ?? 'You cannot delete this comment.'
            );
        }

        return $this->success(null, 'Comment deleted.');
    }

    private function guardVisible(Request $request, Post $post): ?JsonResponse
    {
        $visible = $this->feedService->findVisible((int) $post->id, $request->user()?->id);

        return $visible ? null : $this->notFound('Post not found.');
    }
}
