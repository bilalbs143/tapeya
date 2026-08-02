<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\Post\StorePostViewRequest;
use App\Models\Post;
use App\Services\Post\PostFeedService;
use App\Services\Post\PostViewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class PostViewController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly PostViewService $views,
        private readonly PostFeedService $feedService,
    ) {}

    public function store(StorePostViewRequest $request, Post $post): JsonResponse
    {
        $visible = $this->feedService->findVisible((int) $post->id, $request->user()?->id);
        if (! $visible) {
            return $this->notFound('Post not found.');
        }

        try {
            $result = $this->views->record(
                $visible,
                $request->user(),
                $request->validated(),
                $request,
            );
        } catch (ValidationException $e) {
            return $this->failure(
                collect($e->errors())->flatten()->first() ?? 'Invalid view.',
                'VALIDATION_ERROR',
                $e->errors()
            );
        }

        return $this->success($result);
    }
}
