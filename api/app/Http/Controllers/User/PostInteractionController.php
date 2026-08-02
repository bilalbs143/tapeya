<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\Post\StorePostReportRequest;
use App\Http\Requests\User\Post\StorePostShareRequest;
use App\Models\Post;
use App\Services\Post\PostFeedService;
use App\Services\Post\PostInteractionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PostInteractionController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly PostInteractionService $interactions,
        private readonly PostFeedService $feedService,
    ) {}

    public function like(Request $request, Post $post): JsonResponse
    {
        if ($deny = $this->guardVisible($request, $post)) {
            return $deny;
        }

        return $this->success($this->interactions->like($post, $request->user()));
    }

    public function unlike(Request $request, Post $post): JsonResponse
    {
        if ($deny = $this->guardVisible($request, $post)) {
            return $deny;
        }

        return $this->success($this->interactions->unlike($post, $request->user()));
    }

    public function save(Request $request, Post $post): JsonResponse
    {
        if ($deny = $this->guardVisible($request, $post)) {
            return $deny;
        }

        return $this->success($this->interactions->save($post, $request->user()));
    }

    public function unsave(Request $request, Post $post): JsonResponse
    {
        if ($deny = $this->guardVisible($request, $post)) {
            return $deny;
        }

        return $this->success($this->interactions->unsave($post, $request->user()));
    }

    public function share(StorePostShareRequest $request, Post $post): JsonResponse
    {
        if ($deny = $this->guardVisible($request, $post)) {
            return $deny;
        }

        return $this->success(
            $this->interactions->share(
                $post,
                $request->user(),
                $request->validated('channel') ?? 'copy_link',
            )
        );
    }

    public function report(StorePostReportRequest $request, Post $post): JsonResponse
    {
        $visible = $this->feedService->findVisible((int) $post->id, $request->user()?->id);
        if (! $visible) {
            return $this->notFound('Post not found.');
        }

        try {
            $result = $this->interactions->report(
                $visible,
                $request->user(),
                $request->validated('reason'),
                $request->validated('details'),
            );
        } catch (ValidationException $e) {
            return $this->failure(
                collect($e->errors())->flatten()->first() ?? 'Invalid report.',
                'VALIDATION_ERROR',
                $e->errors()
            );
        }

        return $this->success($result, 'Report submitted.');
    }

    private function guardVisible(Request $request, Post $post): ?JsonResponse
    {
        $visible = $this->feedService->findVisible((int) $post->id, $request->user()?->id);

        return $visible ? null : $this->notFound('Post not found.');
    }
}
