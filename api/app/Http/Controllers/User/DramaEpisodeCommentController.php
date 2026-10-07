<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\Drama\StoreDramaEpisodeCommentRequest;
use App\Http\Resources\User\DramaEpisodeCommentResource;
use App\Models\DramaEpisode;
use App\Models\DramaEpisodeComment;
use App\Services\Drama\DramaEpisodeCommentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class DramaEpisodeCommentController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly DramaEpisodeCommentService $comments,
    ) {}

    public function index(Request $request, DramaEpisode $drama_episode): JsonResponse
    {
        if (! $drama_episode->is_active) {
            return $this->notFound('Episode not found.');
        }

        $paginator = $this->comments->listTopLevel(
            $drama_episode,
            (int) $request->query('per_page', 20),
        );

        $this->comments->attachViewerLiked($paginator->items(), $request->user());

        return $this->success([
            'items' => DramaEpisodeCommentResource::collection($paginator->items()),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
        ]);
    }

    public function replies(Request $request, DramaEpisode $drama_episode, DramaEpisodeComment $comment): JsonResponse
    {
        if (! $drama_episode->is_active) {
            return $this->notFound('Episode not found.');
        }

        if ((int) $comment->drama_episode_id !== (int) $drama_episode->id) {
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
            'items' => DramaEpisodeCommentResource::collection($paginator->items()),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
        ]);
    }

    public function store(StoreDramaEpisodeCommentRequest $request, DramaEpisode $drama_episode): JsonResponse
    {
        if (! $drama_episode->is_active) {
            return $this->notFound('Episode not found.');
        }

        try {
            $comment = $this->comments->create(
                $drama_episode,
                $request->user(),
                (string) $request->validated('body'),
                $request->validated('parent_id'),
            );
        } catch (ValidationException $e) {
            return $this->failure(
                collect($e->errors())->flatten()->first() ?? 'Invalid request.',
                'VALIDATION_ERROR',
                $e->errors()
            );
        }

        $comment->setAttribute('viewer_liked', false);
        $comment->setAttribute('replies_count', 0);

        return $this->success(new DramaEpisodeCommentResource($comment), 'Comment posted.', 'CREATED');
    }

    public function destroy(Request $request, DramaEpisode $drama_episode, DramaEpisodeComment $comment): JsonResponse
    {
        if ((int) $comment->drama_episode_id !== (int) $drama_episode->id) {
            return $this->notFound('Comment not found.');
        }

        try {
            $this->comments->delete($comment, $request->user());
        } catch (ValidationException $e) {
            return $this->failure(
                collect($e->errors())->flatten()->first() ?? 'Invalid request.',
                'VALIDATION_ERROR',
                $e->errors()
            );
        }

        return $this->noContent();
    }

    public function like(Request $request, DramaEpisode $drama_episode, DramaEpisodeComment $comment): JsonResponse
    {
        if ((int) $comment->drama_episode_id !== (int) $drama_episode->id) {
            return $this->notFound('Comment not found.');
        }

        return $this->success($this->comments->like($comment, $request->user()));
    }

    public function unlike(Request $request, DramaEpisode $drama_episode, DramaEpisodeComment $comment): JsonResponse
    {
        if ((int) $comment->drama_episode_id !== (int) $drama_episode->id) {
            return $this->notFound('Comment not found.');
        }

        return $this->success($this->comments->unlike($comment, $request->user()));
    }
}
